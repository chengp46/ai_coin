import json
import os
import pandas as pd

def handleText(jsonData):
    jsonData = jsonData.replace("变量名", "key")
    jsonData = jsonData.replace("中文", "zh")
    jsonData = jsonData.replace("中繁", "tw")
    jsonData = jsonData.replace("英文", "en")
    jsonData = jsonData.replace("韩文", "ko")
    jsonData = jsonData.replace("日文", "ja")
    jsonData = jsonData.replace("泰文", "th")
    jsonData = jsonData.replace("越文", "vi")
    jsonData = jsonData.replace("葡语", "po")
    jsonData = jsonData.replace("印尼语", "in")
    jsonData = jsonData.replace("西班牙语", "sp")
    jsonData = jsonData.replace("缅甸语", "bu")
    jsonData = jsonData.replace("备注", "remark")
    return jsonData

def handleImage(jsonData):
    jsonData = jsonData.replace("变量名", "key")
    jsonData = jsonData.replace("路径", "path")
    jsonData = jsonData.replace("多语言(0:无 1:有)", "language")
    jsonData = jsonData.replace("名称", "imageName")
    return jsonData

def handleAudio(jsonData):
    jsonData = jsonData.replace("变量名", "key")
    jsonData = jsonData.replace("路径", "path")
    jsonData = jsonData.replace("名称", "audioName")
    jsonData = jsonData.replace("多语言(0:无 1:有)", "language")
    jsonData = jsonData.replace("性别(0:无 1:有)", "sex")
    return jsonData

def main():
    # 读取 Excel 文件
    file_path = "多语言配置表.xlsx"
    
    # 读取所有 sheet
    sheets = pd.read_excel(file_path, sheet_name=None)  # 读取所有 sheet，返回一个字典
    output_folder = 'output/'
    os.makedirs(output_folder, exist_ok=True)
    json_output  = {}

    for sheet_name, sheet_data in sheets.items():
        match sheet_name:
            case '文本':
                sheet_name = 'Localized_text'
            case '图片':
                sheet_name = 'Localized_image'
            case '音效':
                sheet_name = 'Localized_audio'
            case _:
                print('无效的表!')
                return
        sheet_data = sheet_data.dropna(how='all')  # 删除全为空的行
        json_output = sheet_data.to_dict(orient="records")  # 转换为 JSON 格式
        jsonData = json.dumps(json_output, ensure_ascii=False)
        match sheet_name:
            case 'Localized_text':
                handleText(jsonData)
            case 'Localized_image':
                handleImage(jsonData)
            case 'Localized_audio':
                jsonData = handleAudio(jsonData)

        jsonObj = json.loads(jsonData)
        json_file_path = os.path.join(output_folder, f"{sheet_name}.json")   
        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(jsonObj, json_file, ensure_ascii=False, indent=4)
            #print(json_output)

if __name__ == '__main__':
    main()
