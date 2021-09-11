# cignal

custom *24/7* **_crypto_** alerts

*pullin' all data from the [`coingecko`](https://www.coingecko.com/api/documentations/v3) api*

## usage

deploy the stack parameterized to your needs

> at a minimum you would want to set your notification tactics and receipient email address

## events & tactics

events are just market events

in `cignal` a tactic determines whether, when, and on what coins to notify

tactics are defined in a simple case&space-insensitive string format

with multiple tactics delimited by a semicolon

### `DROP` event

a statistically significant price drop **?min-10%?**

defining a `DROP` event tactic, fx:

```
DROP: DOT,ETH,ENJ,MOVR,KSM
```

would notify on significant price drops in any of the listed currencies

### `LIMIT` event

reached a particular price, fx:

```
LIMIT: DOT:150USD, ETH:15000USD
```

would notify on `DOT` reachin' `150USD` and `ETH` `15000USD`

### multi tactics example

```
DROP: DOT,ETH; LIMIT: DOT:150USD,ETH:15000USD
```

tbc