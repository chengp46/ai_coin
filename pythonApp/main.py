import json
import math
import os
from pathlib import Path
import tkinter as tk
from tkinter import filedialog
from tkinter import messagebox
import pandas as pd


class App:
    def __init__(self):
        self.root = tk.Tk()

    def initWindow(self):
        yPos = 30
        self.label = tk.Label(self.root, text="文件路径")
        self.label.pack()
        self.label.place(x=15, y=yPos, width=60, height=30)

        # 输入框
        self.entry = tk.Entry(self.root)
        self.entry.place(x=80, y=yPos, width=320, height=30)

        self.openBtn = tk.Button(self.root, text="打开文件", command=self.openFile)
        self.openBtn.pack()
        self.openBtn.place(x=420, y=yPos)

        yPos = 70
        self.label2 = tk.Label(self.root, text="输出路径")
        self.label2.pack()
        self.label2.place(x=15, y=yPos, width=60, height=30)

        # 输入框
        self.entry2 = tk.Entry(self.root)
        self.entry2.place(x=80, y=yPos, width=320, height=30)
        self.entry2.insert(0, os.getcwd() + "\\output\\")

        self.openBtn2 = tk.Button(self.root, text="打开目录", command=self.openDir)
        self.openBtn2.pack()
        self.openBtn2.place(x=420, y=yPos)

        self.exportBtn = tk.Button(self.root, text="导出", command=self.onExportBtn)
        self.exportBtn.pack()
        self.exportBtn.place(x=400 / 2, y=150, width=100, height=30)

    def openFile(self):
        file_path = filedialog.askopenfilename(
            initialdir=".",  # 设置默认打开当前路径
            title="选择文件",
            filetypes=[("excel文件", "*.xlsx"), ("所有文件", "*.*")],
        )
        self.entry.insert(0, file_path)

    def openDir(self):
        folder_path = filedialog.askdirectory(
            initialdir=".", title="选择文件夹"  # 默认打开当前路径
        )
        self.entry2.delete(0, tk.END)
        self.entry2.insert(0, folder_path)

    # 导出按钮
    def onExportBtn(self):
        ouputDir = self.entry2.get()
        os.makedirs(ouputDir, exist_ok=True)
        text = self.entry.get()
        if text:
            if self.exportExcel(text, ouputDir):
                messagebox.showinfo("提示", "导出成功!")
        else:
            messagebox.showinfo("提示", "请输入文件路径!")

    def exportExcel(self, filePath: str, ouputDir: str):
        file_path = Path(filePath)
        if not file_path.exists():
            messagebox.showinfo("提示", "文件不存在!")
            return False

        sheets = pd.read_excel(
            filePath, sheet_name=None
        )  # 读取所有 sheet，返回一个字典
        for sheet_name, sheet_data in sheets.items():
            match sheet_name:
                case "文本":
                    sheet_name = "Localized_text"
                    self.exportText(sheet_data, ouputDir, sheet_name)
                case "图片":
                    sheet_name = "Localized_image"
                    self.exportImage(sheet_data, ouputDir, sheet_name)
                case "音效":
                    sheet_name = "Localized_audio"
                    self.exportAudio(sheet_data, ouputDir, sheet_name)
                case _:
                    messagebox.showinfo("提示", "无效的表!")
                    return False
        return True

    def exportText(self, sheet_data, ouputDir: str, sheet_name: str):
        sheet_data = sheet_data.dropna(how="all")  # 删除全为空的行
        json_output = sheet_data.to_dict(orient="records")  # 转换为 JSON 格式
        jsonData = json.dumps(json_output, ensure_ascii=False)
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
        jsonData = jsonData.replace("NaN", 'null')
        jsonObj = json.loads(jsonData)
        json_file_path = os.path.join(ouputDir, f"{sheet_name}.json")
        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(jsonObj, json_file, ensure_ascii=False, indent=4)

    def exportImage(self, sheet_data, ouputDir: str, sheet_name: str):
        sheet_data = sheet_data.dropna(how="all")
        json_output = sheet_data.to_dict(orient="records")
        jsonData = json.dumps(json_output, ensure_ascii=False)
        jsonData = jsonData.replace("变量名", "key")
        jsonData = jsonData.replace("路径", "path")
        jsonData = jsonData.replace("多语言(0:无 1:有)", "bLanguage")
        jsonData = jsonData.replace("名称", "imageName")
        jsonData = jsonData.replace("NaN", 'null')
        jsonObj = json.loads(jsonData)
        json_file_path = os.path.join(ouputDir, f"{sheet_name}.json")
        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(jsonObj, json_file, ensure_ascii=False, indent=4)

    def exportAudio(self, sheet_data, ouputDir: str, sheet_name: str):
        sheet_data = sheet_data.dropna(how="all")
        json_output = sheet_data.to_dict(orient="records")
        jsonData = json.dumps(json_output, ensure_ascii=False)
        jsonData = jsonData.replace("变量名", "key")
        jsonData = jsonData.replace("路径", "path")
        jsonData = jsonData.replace("名称", "audioName")
        jsonData = jsonData.replace("多语言(0:无 1:有)", "bLanguage")
        jsonData = jsonData.replace("性别(0:无 1:有)", "bSex")
        jsonData = jsonData.replace("NaN", 'null')
        jsonObj = json.loads(jsonData)
        json_file_path = os.path.join(ouputDir, f"{sheet_name}.json")
        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(jsonObj, json_file, ensure_ascii=False, indent=4)



def main():
    app = App()
    app.root.geometry("500x200")
    app.root.title("多语言配置工具")
    # 禁止最大化（禁用水平和垂直拉伸）
    app.root.resizable(False, False)
    # # 只禁用最大化按钮（Windows 专用）
    # app.root.attributes("-toolwindow", True)
    app.initWindow()
    # 运行主循环
    app.root.mainloop()


if __name__ == "__main__":
    main()
