import json
from typing import Any

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
panel_name = ""

for panel in panels_data:
    panel_name = ""
    panel_name = panel["panel_name"]
    panel_data_file = panel["panel_data"]
    interface_str += "export interface " + panel_name + "Interface {\n"
    interface_map_str += f"     \"{panel_name}\":\t{panel_name}Interface;\n"
    initial_values_str += f"export const {panel_name}InitialValues: Interface.{panel_name}Interface['input'] = {{\n"
    interface_str += "  input: {\n"
    with open(f'{base_folder}{panel_data_file}.json', 'r') as file:
        panel_data = json.load(file)
    for item in panel_data:
        backend_name = item["backend_name"]
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


# with open(f"{base_folder}../Common/InterfaceMap.interface.tsx", "w") as interface_map_file:
#     interface_map_file.write(interface_map_str)


interface_file.close()
# interface_map_file.close()






