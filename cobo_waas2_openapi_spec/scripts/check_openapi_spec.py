import re
import sys

import yaml


def check_camel_case(name):
    return re.match(r"^[a-z]+(?:[A-Z][a-z]+)*$", name) is not None


def check_pascal_case(name):
    return re.match(r"^[A-Z][a-zA-Z0-9]*$", name) is not None


def is_snake_case(s):
    return re.match(r"^[a-z0-9_]*$", s) is not None


def check_properties_snake_case(schema):
    properties = schema.get("properties", {})
    for prop_name in properties.keys():
        if not is_snake_case(prop_name):
            print(
                f"Error: Property name '{prop_name}' in schema:{schema} is not in snake_case."
            )
            return False
    return True


def check_component_naming(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            openapi_data = yaml.safe_load(f)
        except yaml.YAMLError:
            print(f"Error: {file_path} is not a valid YAML file.")
            return False
        components = openapi_data.get("components", {})
        schemas = components.get("schemas", {})
        # check schemas is PascalCase
        for component_name, schema in schemas.items():
            if not check_pascal_case(component_name):
                print(
                    f"Error: Component name '{component_name}' in schemas should be PascalCase."
                )
                return False
            if not check_properties_snake_case(schema):
                return False
        # check parameters, request_bodies, responses is camelCase
        for key in ["parameters", "requestBodies", "responses"]:
            data = components.get(key, {})
            for name, schema in data.items():
                if not check_camel_case(name):
                    print(
                        f"Error: Component name '{name}' in {key} shoud be camelCase."
                    )
                if (
                    key == "parameters"
                    and not is_snake_case(schema["name"])
                    and not schema["in"] == "header"
                ):
                    print(f"Error: Name of parameter '{name}' should be snake_case.")
                    return False
    return True


def check_path_error_codes(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            openapi_data = yaml.safe_load(f)
        except yaml.YAMLError:
            print(f"Error: {file_path} is not a valid YAML file.")
            return False
        paths = openapi_data.get("paths", {})
        for path, item in paths.items():
            for method in ["get", "put", "post", "delete", "options", "head", "patch"]:
                if method not in item:
                    continue
                operation = item.get(method)
                responses = operation.get("responses", {})
                has_status_codes = False
                for key in responses.keys():
                    if key.startswith("4") or key.startswith("5"):
                        has_status_codes = True
                        break
                if not has_status_codes:
                    print(
                        f"Error: Missing error response statuses in path '{path}', method: {method.upper()}."
                    )
                    return False

                pattern = re.compile(r"20\d{2,}")
                description = operation.get("description", "")
                error_codes = pattern.search(description)
                if not error_codes:
                    print(
                        f"Error: Missing error codes in path '{path}', method: {method.upper()}."
                    )
                    continue
                    # return False

    return True


def main():
    files = sys.argv[1:]
    exit_code = 0

    for file_path in files:
        if not check_component_naming(file_path):
            exit_code = 1
        if not check_path_error_codes(file_path):
            exit_code = 1

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
