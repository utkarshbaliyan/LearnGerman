"""Plan/apply S3 abandoned-upload cleanup without changing the running stack.

Requires botocore or AWS CLI v2's Python. Retention rules and completed objects
are preserved. An apply refuses unexpected concurrent lifecycle changes.
"""
import argparse
import copy
import json
from pathlib import Path


RULE = {'ID': 'AbortIncompleteUploads', 'Filter': {'Prefix': ''}, 'Status': 'Enabled',
        'AbortIncompleteMultipartUpload': {'DaysAfterInitiation': 7}}


def storage_cleanup_lifecycle(lifecycle):
    updated = copy.deepcopy(lifecycle)
    rules = updated.setdefault('Rules', [])
    existing = next((r for r in rules if r.get('ID') == RULE['ID']), None)
    if existing is not None and existing != RULE:
        raise ValueError('Existing cleanup rule differs; inspect before changing it.')
    if existing is None:
        rules.append(copy.deepcopy(RULE))
    return updated


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['plan', 'apply'])
    args = parser.parse_args()
    try:
        import botocore.session as session_module
    except ImportError:
        import awscli.botocore.session as session_module
    config = json.loads(Path(__file__).with_name('deployment.json').read_text())
    s3 = session_module.get_session().create_client('s3', region_name=config['region'])
    receipt_path = Path('.local-piper/aws-release/storage-cleanup-plan.json')

    def current(bucket):
        try:
            result = s3.get_bucket_lifecycle_configuration(Bucket=bucket)
        except s3.exceptions.ClientError as error:
            if error.response['Error']['Code'] != 'NoSuchLifecycleConfiguration':
                raise
            return {}
        return {key: result[key] for key in ['Rules', 'TransitionDefaultMinimumObjectSize'] if key in result}

    if args.action == 'plan':
        plan = []
        for name in ['ArtifactBucket', 'MediaBucket', 'BackupBucket']:
            before = current(config[name])
            plan.append({'bucket': config[name], 'before': before, 'after': storage_cleanup_lifecycle(before)})
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        receipt_path.write_text(json.dumps(plan, indent=2) + '\n')
        print('Planned seven-day abandoned-upload cleanup for three project buckets.')
        print('Completed objects, existing retention and application configuration remain unchanged.')
        return

    for change in json.loads(receipt_path.read_text()):
        if change['bucket'] not in [config[name] for name in ['ArtifactBucket', 'MediaBucket', 'BackupBucket']]:
            raise ValueError('Unexpected bucket in plan.')
        if change['after'] != storage_cleanup_lifecycle(change['before']):
            raise ValueError('Unexpected changes in the saved plan.')
        observed = current(change['bucket'])
        if observed.get('Rules', []) == change['after']['Rules']:
            print('Already configured:', change['bucket'])
            continue
        if observed != change['before']:
            raise ValueError('Lifecycle changed since planning; inspect before applying.')
        after = change['after']
        s3.put_bucket_lifecycle_configuration(Bucket=change['bucket'],
                                            LifecycleConfiguration={'Rules': after['Rules']},
                                            **({key: after[key] for key in ['TransitionDefaultMinimumObjectSize'] if key in after}))
        if current(change['bucket'])['Rules'] != after['Rules']:
            raise RuntimeError('Lifecycle verification failed.')
        print('Verified cleanup:', change['bucket'])


if __name__ == '__main__':
    main()
