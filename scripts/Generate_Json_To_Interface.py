import json
import os

base_folder = "../frontend/src/data/"
# Map JSON types to TypeScript types
type_mapping = {
    "string": "string",
    "number": "number",
    "boolean": "boolean",
}

with open(f'{base_folder}Panels.json', 'r') as file:
    panels_data = json.load(file)

file.close()

interface_str = ""
interface_map_str = "export type InterfaceMap = {\n"
initial_values_str = "import * as Interface from './Panels.interface'\n\n"
backend_config_str = ""
panel_name = ""

for panel in panels_data:
    panel_name = panel["panel_name"]
    interface_str += "export interface " + panel_name + "Interface {\n"
    interface_map_str += f"     \"{panel_name}\":\t{panel_name}Interface;\n"
    initial_values_str += f"export const {panel_name}InitialValues: Interface.{panel_name}Interface['input'] = {{\n"
    interface_str += "  input: {\n"
    backend_config_str += os.path.abspath(base_folder) + panel_name + ".json\n"
    try:
        with open(f'{base_folder}{panel_name}.json', 'r') as file:
            panel_data = json.load(file)
    except FileNotFoundError:
        raise FileNotFoundError(f"The file '{base_folder}{panel_name}.json' was not found.")
    except json.JSONDecodeError:
        raise ValueError(f"The file '{base_folder}{panel_name}.json' contains invalid JSON.")
    except Exception as e:
        # Catch any other exceptions
        raise RuntimeError(f"An unexpected error occurred: {e}")
    for item in panel_data:
        backend_data = item["backend"]
        backend_name = backend_data["key"]
        backend_type = "string"
        initial_value = "\"\"" if backend_type == "string" else "0" if backend_type == "number" else "false" if backend_type == "boolean" else "0"

        interface_str += f"     \"{backend_name}\":\t{backend_type},\n"
        initial_values_str+= f"     \"{backend_name}\":\t{initial_value},\n"

    # Close the interface definition
    interface_str += "  }\n"
    initial_values_str += "}\n\n"
    interface_str += "  handleSendRequest?: (switchName: string, switchValue: string) => void;\n"
    interface_str += "}\n\n"

initial_values_str += "export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {\n"

for panel in panels_data:
    initial_values_str += f"\t\"{panel['panel_name']}\":\t{panel['panel_name']}InitialValues,\n"

initial_values_str += "}\n\n"

interface_map_str += "}\n\n"
interface_map_str += "export type InterfaceKey = keyof InterfaceMap;"

interface_str += interface_map_str

with open(f"{base_folder}../Common/Panels.interface.tsx", "w") as interface_file:
    interface_file.write(interface_str)

with open(f"{base_folder}../Common/Panels.initial.tsx", "w") as initial_file:
    initial_file.write(initial_values_str)

# Ensure the directory exists
os.makedirs("../config", exist_ok=True)

with open(f"../config/backendConfig.txt", "w") as backend_config_file:
    backend_config_file.write(backend_config_str)
# with open(f"{base_folder}../Common/InterfaceMap.interface.tsx", "w") as interface_map_file:
#     interface_map_file.write(interface_map_str)


interface_file.close()
initial_file.close()
backend_config_file.close()
# interface_map_file.close()






