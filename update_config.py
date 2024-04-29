import os
import json
import sys


def update():
    try:
        os.system("cp cobo_waas2_openapi_spec/dev_openapi.yaml api-references/v2/")
        output = os.popen(
            "npx @mintlify/scraping@latest openapi-file api-references/v2/dev_openapi.yaml "
            "-o api-references/v2 | sed '1d'").read()
        write_data = json.loads(output)

        with open("mint.json", "r") as file:
            file_data = json.load(file)

        for write_group in write_data:
            write_group_name = write_group["group"]
            for index, file_group in enumerate(file_data["navigation"]):
                file_group_name = file_group["group"]
                if write_group_name == file_group_name:
                    del file_data["navigation"][index]

        for write_group in write_data:
            write_group["version"] = "V2"
            file_data["navigation"].append(write_group)

        with open("mint.json", "w") as file:
            json.dump(file_data, file, indent=2)
    except Exception as e:
        print(e)
        sys.exit(1)


if __name__ == "__main__":
    update()
