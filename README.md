<img src="./public/logo.png" width="120" alt="logo">

# 蚕食单词

<img width="1624" alt="Screenshot 2025-05-23 at 23 39 02" src="https://github.com/user-attachments/assets/fe0dbf24-55b7-4b2f-bf5b-052e7498b06d" />



## 功能
- 切换展示 初中、高中、CET4、CET6、考研、托福、SAT 词库
- 右击显示词条注释
- 点击词条暗化它，表示已知，有点蚕食的感觉
- <kbd>Ctrl</kbd> + 点击 = 取消标记某个词条
- <kbd>/</kbd> + 点击 = 添加到未确定词组

## 开发

- 记录存储在 `localstorage` 所以只支持本机。
- 
    使用 [另一个库](https://github.com/KyleBing/english-vocabulary) 的内容作为词库来源
    clone 库到本地后，执行以下完成分库的安装
    ```sh
    git submodule init
    git submodule update 
    ```

## git submodule

- path: `./src/vocabulary`
- git submodule:  [`https://github.com/KyleBing/english-vocabulary`](https://github.com/KyleBing/english-vocabulary)
