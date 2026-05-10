# Honkai Storybrand Archive

重新寫的一個靜態網站版本，適合放上 GitHub Pages。

## 主要頁面

- `index.html`：首頁 / project overview
- `brand.html`：品牌分析
- `story.html`：故事設計與角色弧光
- `campaign.html`：互動式「記憶檔案」prototype
- `characters.html`：角色圖鑑
- `reflection.html`：批判反思
- `resources.html`：Written report / PPT 作業地圖
- `gallery.html`：月下展示區

## 部署到 GitHub Pages

1. 把整個資料夾內的檔案放入 GitHub repository 根目錄。
2. Commit and push。
3. Repository settings → Pages → Branch: `main` → root。
4. 等 GitHub Pages build 完成。

## Notes

- 全站無需後端。
- `campaign.html` 的留言牆使用 `localStorage`，只會保存在使用者自己的瀏覽器。
- 圖片資產沿用你原本上傳 zip 內的角色圖。
