#!/bin/sh

# Not a complete failsafe, but better than nothing
set -e

cd charts

echo installing the Vault Helm chart
helm install vault rp-vault --values values.yaml --wait

echo waiting for pods
kubectl -n vault wait --for=condition=Ready pods/vault-0

echo initializing Vault
OUT=$(kubectl -n vault exec -it statefulsets/vault -- vault operator init -n 1 -t 1 -format json)

ROOT_TOKEN=$(echo $OUT | jq -r '.root_token')
UNSEAL_KEYS_B64=$(echo $OUT | jq -r '.unseal_keys_b64[0]')
UNSEAL_KEYS_HEX=$(echo $OUT | jq -r '.unseal_keys_hex[0]')

echo obtained root token: $ROOT_TOKEN
echo obtained unseal key: $UNSEAL_KEYS_B64

echo unsealing
kubectl -n vault exec -it statefulsets/vault -- vault operator unseal $UNSEAL_KEYS_B64

echo logging in
kubectl -n vault exec -it statefulsets/vault -- vault login $ROOT_TOKEN

echo running policy creation script
kubectl -n vault exec -it statefulsets/vault -- sh /home/create-policies.sh

echo installing MongoDB Helm chart
helm install mongo rp-mongo --namespace=vault --values values.yaml --wait

echo running mongo policy creation script
kubectl -n vault exec -it statefulsets/vault -- sh /home/create-mongo-policies.sh

echo adding the API key to the vault
kubectl -n vault exec -it vault-0 -- vault kv put secret/path/is/in/vault/values apiKey=$1

echo done!