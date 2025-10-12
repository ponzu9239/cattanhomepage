// common.js の内容

// ヘッダー/フッターを読み込む関数
async function loadComponent(placeholderId, url) {
    try {
        const response = await fetch(url);
        // file://プロトコル対策: 失敗してもコンソールエラーを出すだけに留める
        if (!response.ok) {
            console.warn(`Failed to fetch ${url}. This may be expected if running locally.`);
            return;
        }
        const html = await response.text();
        document.getElementById(placeholderId).innerHTML = html;
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

// 読み込み後にハンバーガーメニューのイベントを設定する関数
function setupHeader(headerFile) {
    // 1. ヘッダーとフッターを読み込む
    loadComponent('header-placeholder', headerFile);
    loadComponent('footer-placeholder', 'footer.html');
    
    // 2. 読み込みが完了するのを少し待ってから、ハンバーガーメニューのイベントを設定
    setTimeout(() => {
        const hamburger = document.getElementById("hamburger");
        const nav = document.getElementById("nav");
        
        if (hamburger && nav) {
            hamburger.addEventListener("click", () => {
                nav.classList.toggle("show");
            });
        }
    }, 150); 
}

// ----------------------------------------------------
// ★ 共通のJSロジック (誕生日モードのロジックは削除されました) ★
// ----------------------------------------------------


// DOMContentLoadedイベントで共通処理を実行
document.addEventListener("DOMContentLoaded", () => {
    // ★ setupHeader は呼び出し元ページで実行されます。 ★
});
