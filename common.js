// common.js の内容 (PC/モバイル統合版 - transformベースのナビゲーションに修正)

// ヘッダー/フッターを読み込み、指定された要素に挿入する関数
async function loadComponent(placeholderId, url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn(`Failed to fetch ${url} (HTTP status: ${response.status}). If you are running locally via 'file://' protocol, this is expected.`);
            return false; 
        }
        
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
        }
        return true;

    } catch (error) {
        console.error("Error loading component:", url, error);
        return false; 
    }
}

/**
 * ヘッダー/フッターを読み込み、読み込み完了後にハンバーガーメニューのイベントを設定する関数。
 * CSSをtransformベースの開閉ロジックに変更したため、JSからはCSSクラスをトグルするのみに変更。
 * @param {string} headerFile 読み込むヘッダーHTMLファイル名
 */
async function setupHeader(headerFile) {
    // 1. ヘッダーを読み込む。読み込み完了を待つ (await)
    const headerLoaded = await loadComponent('header-placeholder', headerFile);

    // 2. フッターを読み込む (非同期で実行)
    loadComponent('footer-placeholder', 'footer.html'); 
    
    // 3. ヘッダーがDOMに挿入されたことを確認してから、イベントを設定
    if (headerLoaded) {
        // DOM要素を再取得
        const hamburger = document.getElementById("hamburger");
        const nav = document.getElementById("nav");
        
        // ★修正: CSSのtransformによる開閉ロジックを採用するため、動的な top の計算は不要になりました。★
        
        if (hamburger && nav) {
            // 初期ロード時にメニューを確実に閉じる (CSSのデフォルト設定に戻る)
            nav.classList.remove("show"); 

            // イベントリスナーの登録
            hamburger.addEventListener("click", () => {
                // show クラスをトグルするだけで、CSSの transform がアニメーションを行う
                nav.classList.toggle("show");
            });
            
            // 画面サイズ変更時にもメニューを閉じる
            window.addEventListener('resize', () => {
                nav.classList.remove("show"); 
            });
        } else {
             console.warn("Hamburger or Nav elements not found after header load. Check the header HTML.");
        }
    } else {
        console.error("Header file could not be loaded, skipping hamburger setup.");
    }
}

// DOMContentLoadedイベントで共通処理を実行
document.addEventListener("DOMContentLoaded", () => {
    // このファイル内では何も実行せず、呼び出し元ページで setupHeader が実行されることを想定
});
