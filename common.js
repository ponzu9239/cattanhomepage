// common.js の内容

// ヘッダー/フッターを読み込み、指定された要素に挿入する関数
async function loadComponent(placeholderId, url) {
    try {
        const response = await fetch(url);
        
        // file://プロトコル対策: ネットワーク応答がない場合を考慮
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
        // ネットワークエラー、CORSエラーなどが発生した場合
        console.error("Error loading component:", url, error);
        return false; 
    }
}

/**
 * ヘッダー/フッターを読み込み、読み込み完了後にハンバーガーメニューのイベントを設定する関数。
 * 非同期処理(await)を使用することで、DOM要素が存在することを保証する。
 * @param {string} headerFile 読み込むヘッダーHTMLファイル名
 */
async function setupHeader(headerFile) {
    // 1. ヘッダーを読み込む。読み込み完了を待つ (await)
    const headerLoaded = await loadComponent('header-placeholder', headerFile);

    // 2. フッターを読み込む (非同期で実行)
    loadComponent('footer-placeholder', 'footer.html'); 
    
    // 3. ヘッダーがDOMに挿入されたことを確認してから、イベントを設定
    if (headerLoaded) {
        // DOM要素を再取得 (header-user.htmlの内容がinnerHTMLで挿入された後)
        const hamburger = document.getElementById("hamburger");
        const nav = document.getElementById("nav");
        const header = document.querySelector('header');
        
        // ナビゲーション位置を動的に調整する関数
        function updateNavPosition() {
            if (header && nav) {
                nav.style.top = header.offsetHeight + 'px';
            }
        }
        
        if (hamburger && nav) {
            // ★ 修正箇所: 初期ロード時にメニューを確実に閉じる ★
            nav.classList.remove("show"); 
            updateNavPosition(); // 初期位置を設定
            
            // ハンバーガーメニューのイベントを設定
            hamburger.addEventListener("click", () => {
                nav.classList.toggle("show");
                updateNavPosition(); // 開閉時にも高さを再調整
            });
            
            // 画面サイズ変更時にも高さを更新
            window.addEventListener('resize', updateNavPosition);
        } else {
             console.warn("Hamburger or Nav elements not found after header load. Check 'header-user.html'.");
        }
    } else {
        console.error("Header file could not be loaded, skipping hamburger setup.");
    }
}

// DOMContentLoadedイベントで共通処理を実行
document.addEventListener("DOMContentLoaded", () => {
    // このファイル内では何も実行せず、呼び出し元ページで setupHeader が実行されることを想定
});
