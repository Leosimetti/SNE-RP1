# Research Project 1

## Deployment Steps

1. Deploy Vault
```shell
helm install vault rp-vault
```

2. Initialize and unseal Vault, run a script to create basic policies
```shell
kubectl -n vault exec -it vault-0 -- sh
vault operator init -n 1 -t 1 // will create two tokens: unseal and root 
vault operator unseal <unseal token goes here>
vault login <root token goes here>
sh /home/create-policies.sh
```

3. Deploy MongoDB
```shell
helm install mongo rp-mongo --namespace=vault
```

4. Create policies for MondoDB credentials rotation
```shell
kubectl -n vault exec -it vault-0 -- sh
vault login <root token goes here>
sh /home/create-mongo-policies.sh
```

5. Create application secrets in Vault
```shell
vault kv put secret/path/is/in/vault/values apiKey=***
```

6. Deploy the application
```shell
helm install app manual-rp-chart --namespace=vault
```

Wait 10-15 seconds after this step.

7. Go to the application service and query its endpoint:
```
kubectl -n vault port-forward svc/manual-rp-service 32343:3000
```
