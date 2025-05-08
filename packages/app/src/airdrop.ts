import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const main = async () => {
    
    try {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

        const trx = await connection.requestAirdrop(new PublicKey("HcikBBJaAUTZXyqHQYHv46NkvwXVigkk2CuQgGuNQEnX"), 2 * 10 ** 9);
        console.log(`https://explorer.solana.com/tx/${trx}?cluster=devnet`)
        const bal = await connection.getBalance(new PublicKey("HcikBBJaAUTZXyqHQYHv46NkvwXVigkk2CuQgGuNQEnX"));
        console.log("bal:",bal / 10 ** 9)


        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    } catch (error) {
        console.error("could not airdrop ::: ", error)
    }

console.log("done >>>>")
}
main();

setInterval(async () => {
console.log("calling liquidation cron ...")
try {
    main();
} catch (error) {
    console.error("error:",error);
}
console.log("done..")
}, 30000)