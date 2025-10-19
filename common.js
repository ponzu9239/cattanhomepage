// common.js (全文)

// ---------------------------------------------------
// ★ 1. ヘッダー/フッターのHTMLを挿入する関数 (軽量版) ★
// ---------------------------------------------------
const navLinks = [
    { href: "index.html", text: "ホーム" },
    { href: "bingo.html", text: "抽選管理" },
    { href: "bingo_card.html", text: "カード作成" },
    { href: "team-maker.html", text: "チーム分け" }
];

/**
 * ヘッダー、ナビゲーション、フッターの共通要素をDOMに挿入し、ハンバーガーメニューのイベントを設定します。
 */
function setupCommonElements() {
    // ヘッダー要素を構築
    const headerContainer = document.querySelector('header');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <h1>参加型配信支援ツール</h1>
            <div class="hamburger" id="hamburger" onclick="toggleNav()">☰</div>
        `;
    }
    
    // ナビゲーション要素を構築
    const navElement = document.getElementById('nav');
    if (navElement) {
        navElement.innerHTML = navLinks.map(link => 
            `<a href="${link.href}">${link.text}</a>`
        ).join('');
    }
    
    // フッター要素を構築
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.innerHTML = '&copy; 2024 Project Name. All rights reserved.';
    }

    // ハンバーガーメニューの開閉ロジックを設定
    const hamburger = document.getElementById("hamburger");
    const header = document.querySelector('header');

    if (hamburger && navElement) {
        // 画面サイズ変更時、メニューを確実に閉じる/位置をリセット
        window.addEventListener('resize', () => {
            navElement.classList.remove("show"); 
            updateNavPosition(navElement, header);
        });

        // 初期ロード時に位置を調整
        updateNavPosition(navElement, header);
    }
}

/**
 * ナビゲーションの開閉を制御するグローバル関数。
 * HTMLのonclickイベントから呼び出される。
 */
window.toggleNav = function() {
    const nav = document.getElementById('nav');
    const header = document.querySelector('header');
    if (nav) {
        nav.classList.toggle('show');
        updateNavPosition(nav, header);
    }
};

/**
 * ナビゲーションの位置を動的に調整するヘルパー関数
 */
function updateNavPosition(nav, header) {
    if (header && nav) {
        // CSSの変数からヘッダー高を取得 (フォールバックとして140pxを使用)
        const headerHeightCSS = getComputedStyle(document.documentElement)
                                .getPropertyValue('--header-fixed-height').trim();
        const headerHeight = headerHeightCSS ? parseFloat(headerHeightCSS) : 140;

        if (nav.classList.contains('show')) {
            // 開いている場合
            nav.style.top = headerHeight + 'px';
        } else {
            // 閉じている場合
            nav.style.top = '-100vh';
        }
    }
}


// ---------------------------------------------------
// ★ 2. ビンゴ抽選ロジック (管理者ページ - bingo.html用) ★
// ---------------------------------------------------
let bingoNumbers = Array.from({length: 75}, (_, i) => i + 1);
let drawnNumbers = [];
let drawingInterval = null;
let isDrawing = false;
const currentNumberDisplay = document.getElementById('currentNumber'); // DOMContentLoadedで再取得

/** * 抽選開始/停止を切り替えるメイン関数。
 */
window.drawNumber = function() {
    const drawButton = document.getElementById('drawButton');
    
    if (!drawButton) return;

    if (!isDrawing) {
        // 抽選開始
        const availableNumbers = bingoNumbers.filter(n => !drawnNumbers.includes(n));
        if (availableNumbers.length === 0) return; // 全て抽選済みの場合は何もしない

        isDrawing = true;
        drawButton.textContent = 'STOP';
        drawButton.classList.add('drawing-mode');
        
        // 抽選アニメーション開始
        drawingInterval = setInterval(animateNumber, 50);

    } else {
        // 抽選停止
        clearInterval(drawingInterval);
        isDrawing = false;
        drawButton.textContent = '抽選開始';
        drawButton.classList.remove('drawing-mode');
        
        // 最終番号を決定
        determineFinalNumber();
    }
}

/**
 * 抽選中の番号をランダムに更新するアニメーション
 */
function animateNumber() {
    const availableNumbers = bingoNumbers.filter(n => !drawnNumbers.includes(n));
    if (availableNumbers.length === 0) {
        clearInterval(drawingInterval);
        if (currentNumberDisplay) currentNumberDisplay.textContent = 'FIN';
        document.getElementById('drawButton').disabled = true;
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    if (currentNumberDisplay) {
        currentNumberDisplay.textContent = availableNumbers[randomIndex];
    }
}

/**
 * 抽選を停止し、最終的な番号を決定する。
 */
function determineFinalNumber() {
    const availableNumbers = bingoNumbers.filter(n => !drawnNumbers.includes(n));
    if (availableNumbers.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const finalNumber = availableNumbers[randomIndex];
    drawnNumbers.push(finalNumber); // 確定番号として記録

    if (currentNumberDisplay) {
        currentNumberDisplay.textContent = finalNumber;
        currentNumberDisplay.classList.add('stop-highlight');
    }
    
    updateNumberBoard(finalNumber);

    // アニメーションを解除
    setTimeout(() => {
        if (currentNumberDisplay) {
            currentNumberDisplay.classList.remove('stop-highlight');
        }
    }, 500);
}

/**
 * 75マスボード上のセルに抽選済みマークを付ける。
 * @param {number} number - 抽選された番号
 */
function updateNumberBoard(number) {
    const cell = document.querySelector(`#numberBoard .bingo-cell[data-content='${number}']`);
    if (cell) {
        cell.classList.add('drawn');
        cell.classList.add('stop-flash');
        setTimeout(() => {
            cell.classList.remove('stop-flash');
        }, 500);
    }
}

/**
 * ビンゴゲームをリセットする。
 */
window.resetGame = function() {
    clearInterval(drawingInterval);
    isDrawing = false;
    // 75マスを再生成
    bingoNumbers = Array.from({length: 75}, (_, i) => i + 1);
    drawnNumbers = [];
    
    if (currentNumberDisplay) currentNumberDisplay.textContent = '--';
    const drawButton = document.getElementById('drawButton');
    
    if (drawButton) {
        drawButton.textContent = '抽選開始';
        drawButton.classList.remove('drawing-mode');
        drawButton.disabled = false;
    }

    // ボード上のマークを全て解除
    document.querySelectorAll('#numberBoard .bingo-cell').forEach(cell => {
        cell.classList.remove('drawn', 'stop-flash');
    });
}


// ---------------------------------------------------
// ★ 3. カード生成/読み込みヘルパー (bingo_card.html用) ★
// ---------------------------------------------------

/**
 * 1からmaxまでの数字をcount個、重複なくランダムに抽出する
 * @param {number} count - 抽出する数字の個数
 * @param {number} max - 数字の最大値
 * @returns {number[]} シャッフルされた数字の配列
 */
function generateRandomNumbers(count, max) {
    let numbers = Array.from({length: max}, (_, i) => i + 1);
    // Fisher-Yatesアルゴリズムで配列をシャッフル
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    // 必要な数だけ返す (3x3カードなら9個)
    return numbers.slice(0, count); 
}
window.generateRandomNumbers = generateRandomNumbers; // グローバルに公開

/**
 * URLパラメータからカードの数字を読み込む (元の機能)
 * @returns {number[] | null} 有効なカード数字の配列、またはnull
 */
function loadCardFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');

    if (cardData) {
        // '123456789' のような文字列を数字の配列に戻す
        const numbers = cardData.split('').map(n => parseInt(n, 10));
        
        // 9個の数字で構成され、1から9が使われているか検証
        const isValid = numbers.length === 9 && 
                        numbers.every(n => n >= 1 && n <= 9) &&
                        new Set(numbers).size === 9; // 重複がないこと

        if (isValid) {
            return numbers;
        }
    }
    return null;
}
window.loadCardFromUrl = loadCardFromUrl; // グローバルに公開


// ---------------------------------------------------
// ★ 4. 初期化 ★
// ---------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 共通要素のセットアップ (ヘッダー/フッター/ナビゲーション)
    setupCommonElements();

    const drawBtn = document.getElementById('drawButton');
    const resetBtn = document.getElementById('resetButton');
    const numberBoard = document.getElementById('numberBoard');

    // bingo.html の機能が有効な場合
    if (drawBtn && resetBtn && numberBoard) {
        // ボタンイベントの登録は、window.drawNumber/window.resetGame でグローバルに登録済み
        // drawBtn.addEventListener('click', drawNumber); // <--- HTML側でonclickを使用
        // resetBtn.addEventListener('click', resetGame); // <--- HTML側でonclickを使用

        // bingo.html のボード初期化 (1-75)
        numberBoard.innerHTML = bingoNumbers.map(number => {
            // 10個ごとに改行するためのブレイク要素を挿入
            const breakElement = (number % 10 === 0 && number !== 75) ? '<div class="break"></div>' : '';
            return `<div class="bingo-cell" data-content="${number}"></div>${breakElement}`;
        }).join('');
        
        // 以前の抽選結果がLocalStorageにあれば復元するロジックをここに追加しても良い
    }
});
