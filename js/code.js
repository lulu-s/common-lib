
// 发12下 下载所有音频文件
async function delay(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
for (let i = 21; i <= 104; i++) { await delay(1000); var a = document.createElement('a'); a.href = `https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus/acoustic_grand_piano/p${i}_v79.mp3`; a.click() }