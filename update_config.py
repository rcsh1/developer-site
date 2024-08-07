import subprocess
import json
import sys
import traceback
import os
import shutil


def delete_exist_files():
    folders_to_delete = [
        'v2/api-references/developers--webhooks',
        'v2/api-references/transactions',
        'v2/api-references/wallets',
        'v2/api-references/wallets--mpc-wallets',
    ]

    for folder in folders_to_delete:
        if os.path.exists(folder):
            shutil.rmtree(folder)
            print(f'已删除: {folder}')
        else:
            print(f'文件夹不存在: {folder}')


def update():
    try:
        source_file = "v2/cobo_waas2_openapi_spec/dev_openapi.yaml"
        destination_dir = "v2/api-references/"

        delete_exist_files()

        command = [
            "npx", "@mintlify/scraping@3.0.141", "openapi-file", source_file, "-o", destination_dir
        ]
        original_spec_data = subprocess.run(command, capture_output=True, text=True).stdout.split('\n', 1)[1]

    except Exception as e:
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    update()
