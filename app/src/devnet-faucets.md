# Devnet faucets

BTC - B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP  - oracle - HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J
ETH - BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz  - EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw

## Mango tokens

const DEVNET_MINTS = new Map([
  ['USDC', '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'], // use devnet usdc
  ['BTC', '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU'],
  ['SOL', 'So11111111111111111111111111111111111111112'],
  ['ORCA', 'orcarKHSqC5CDDsGbho8GKvwExejWHxTqGzXgcewB9L'],
  ['MNGO', 'Bb9bsTQa1bGEtQ5KagGkvSHyuLqDWumFUcRqFusFNJWC'],
  ['ETH', 'Cu84KB3tDL6SbFgToHMLYVDJJXdJjenNzSKikeAvzmkA'],
  ['SRM', 'AvtB6w9xboLwA145E221vhof5TddhqsChYcx7Fy3xVMH'],
]);
const DEVNET_ORACLES = new Map([
  ['BTC', 'HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J'],
  ['SOL', 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'],
  ['ORCA', 'A1WttWF7X3Rg6ZRpB2YQUFHCRh1kiXV8sKKLV3S9neJV'],
  ['MNGO', '8k7F9Xb36oFJsjpCKpsXvg4cgBRoZtwNTc3EzG5Ttd2o'],
  ['ETH', 'EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw'],
  ['SRM', '992moaMQKs32GKZ9dxi8keyM2bUmbrwBZpK4p2K6X5Vs'],
]);

---- ETH ---

$ spl-token create-token  --decimals 6                                                                                                          ─╯
Creating token BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz
Decimals:  6

Signature: 4WJAKbfpiGMEgECC5QTNXoErjQ6VDnCgyjQDx2HE9Hf2gF43tmqjTuxAGryaFbDnEY12GaK3EUiq1VyerXW27hhy

$ spl-token create-account BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz                                                                                                             ─╯
Creating account 9VyHEhdu91iBjgop5oJQ4GiC65uTZiLda6YM6mfcmtJq

Signature: 5DzfLdU9t7du2h1yH2oVfxBJmJaJv6i3tX3gfqVbRvVTbbUBmJ3fkh2BekFaN6ihmNi4PdGWw5vcbwAeGrP34pQP

$ spl-token mint BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz 1000000000000 9VyHEhdu91iBjgop5oJQ4GiC65uTZiLda6YM6mfcmtJq                                                            ─╯
Minting 1000000000000 tokens
  Token: BA17bkYW78GvnirtgRHcceQxZdwkhpzbvrwDU6voUXRz
  Recipient: 9VyHEhdu91iBjgop5oJQ4GiC65uTZiLda6YM6mfcmtJq

Signature: 3MDxcbaYGiGaZWcpGhKty1tCFtDx46L2DMeN4GViuoYeRbSZLK5r5m7kjwZEdBzzkEjzx1iTXGH2fmBqJwXN9L1F

---- BTC ---
$  spl-token create-token  --decimals 6                                                                                                                                             ─╯
Creating token B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP
Decimals:  6

Signature: L8q1tuviVyZs6d6ouPuSLZGETz98yHUzLuz2mqccNKPmDBnkQjTZurtYGMgtY2vvbVDwDv8MCT8yeL1GAjy2Syi

$ spl-token create-account B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP                                                                                                             ─╯
Creating account J5RYRoXFzL9obJRsPSKELVzF2EVKS9XrJfryUyLZCQwR

Signature: 3fkLYWbLVbkreMaGzYkC4G1EhiKJhkuuMRW5TR6f344dD6KojPZub259w4xqqPFTC1dBg6zy75qqcoqGNm1hkj2v

$  spl-token mint B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP 21000000 J5RYRoXFzL9obJRsPSKELVzF2EVKS9XrJfryUyLZCQwR                                                                 ─╯
Minting 21000000 tokens
  Token: B8DYqbh57aEPRbUq7reyueY6jaYoN75js5YsiM84tFfP
  Recipient: J5RYRoXFzL9obJRsPSKELVzF2EVKS9XrJfryUyLZCQwR

Signature: 65zkBGGC8ZRz3sr4RBb6nJLjPnAKCquKRGqVprMnurxw44Pc1BdT75kV9c8UbNmktBeSKSCHrdLxMYWUK8fqt4rG
