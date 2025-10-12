// common.js の内容 (PC/モバイル統合版)

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
 * 全ての画面サイズで同じスライド挙動を適用する。
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
        const header = document.querySelector('header');
        
        // ナビゲーションが開く位置を動的に計算する関数 (PC/モバイル共通)
        function updateNavPosition() {
            if (header && nav) {
                const headerHeight = header.offsetHeight;
                
                // navが開いている場合 (showクラスがついている場合)
                if (nav.classList.contains('show')) {
                     // ヘッダーの高さ分だけ下にスライドさせる
                    nav.style.top = headerHeight + 'px'; 
                } else {
                    // 閉じている場合は画面外 (-100vh) にスライドさせる
                     nav.style.top = '-100vh'; 
                }
            }
        }
        
        if (hamburger && nav) {
            // 初期ロード時にメニューを確実に閉じる
            nav.classList.remove("show"); 
            updateNavPosition(); // 初期位置をCSSの設定(-100vh)に戻す

            // イベントリスナーの登録
            hamburger.addEventListener("click", () => {
                nav.classList.toggle("show");
                updateNavPosition(); // 開閉時にも高さを再調整
            });
            
            // 画面サイズ変更時にも高さを更新
            window.addEventListener('resize', () => {
                // サイズ変更時にメニューを閉じ、位置を再設定
                nav.classList.remove("show"); 
                updateNavPosition();
            });
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
