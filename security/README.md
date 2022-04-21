Distilled from: https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8

```
cd security
```

Create `domains.ext`:
```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
```

Then these commands:
```
openssl req -x509 -nodes -new -sha256 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=US/CN=LocalHost-Root-CA"

openssl x509 -outform pem -in RootCA.pem -out RootCA.crt

openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -subj "/C=US/CN=localhost"

openssl x509 -req -sha256 -days 1024 -in localhost.csr -CA RootCA.pem -CAkey RootCA.key -CAcreateserial -extfile domains.ext -out localhost.crt
```

Add `RootCA.crt` to your trusted CA store.

Note: Firefox does [extended validation](https://wikipedia.org/wiki/Extended_Validation_Certificate) by default and so will still require whitelisting. (Click "Advanced..." then "Accept the Risk and Continue".)
