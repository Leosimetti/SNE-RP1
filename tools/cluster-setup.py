import json
import subprocess
import sys

def run_command(cmd: str) -> str:
    return subprocess.run(
        cmd.split(), capture_output=True
    ).stdout.decode("utf-8")


print("Installing the Vault Helm chart")
run_command(r"helm install vault rp-vault --values prod-values.yaml --wait")


print("waiting for pods")
run_command(r"kubectl wait --namespace=vault --for=condition=Ready pod/vault-0")

print("initializing Vault")
init_out = run_command(r"kubectl -n vault exec -it statefulsets/vault -- vault operator init -n 1 -t 1 -format json")
init_json = json.loads(init_out)

root_token = init_json["root_token"]
unseal_keys_b64 = init_json["unseal_keys_b64"][0]
unseal_keys_hex = init_json["unseal_keys_hex"][0]

print(f"obtained root token: {root_token}")
print(f"obtained unseal key: {unseal_keys_b64}")

print("unsealing")
run_command(f"kubectl -n vault exec -it statefulsets/vault -- vault operator unseal {unseal_keys_b64}")

print("logging in")
run_command(f"kubectl -n vault exec -it statefulsets/vault -- vault login {root_token}")

print("running policy creation script")
run_command("kubectl -n vault exec -it statefulsets/vault -- sh /home/create-policies.sh")

print("installing MongoDB Helm chart")
run_command("helm install mongo rp-mongo --namespace=vault --values prod-values.yaml --wait")

print("running mongo policy creation script")
run_command("kubectl -n vault exec -it statefulsets/vault -- sh /home/create-mongo-policies.sh")

print("adding the API key to the vault")
run_command(f"kubectl -n vault exec -it vault-0 -- vault kv put secret/basic-secret/helloworld apiKey={sys.argv[1]}")

print("starting app")
run_command("helm install app manual-rp-chart/ --namespace=vault --values prod-values.yaml --wait")

print("done!")
