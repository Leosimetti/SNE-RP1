import json
import subprocess
import sys

def run_command(cmd: str) -> str:
    out = subprocess.run(cmd.split(), capture_output=True)
    if out.returncode != 0:
        print(out.stderr.decode("utf-8"))
        exit(out.returncode)
    else:
        return out.stdout.decode("utf-8")

if len(sys.argv[1:]) < 1: 
    print("Please specify the API key in the command line arguments")
    exit(1)

print("Installing the Vault Helm chart")
run_command(r"helm install vault charts/rp-vault/ --values charts/values.yaml --wait")

print("waiting for pods")
run_command(r"kubectl wait --namespace=vault --for=condition=Ready pod/vault-0")

key_shares = 5
key_threshold = 3

assert key_shares >= key_threshold

print("initializing Vault")
init_out = run_command(f"kubectl -n vault exec -it statefulsets/vault -- vault operator init -key-shares {key_shares} -key-threshold {key_threshold} -format json")
init_json = json.loads(init_out)

root_token = init_json["root_token"]
unseal_keys_b64 = init_json["unseal_keys_b64"]
unseal_keys_hex = init_json["unseal_keys_hex"]

print(f"obtained root token: {root_token}")
print("obtained unseal keys:\n\t{}".format("\n\t".join(unseal_keys_b64)))

print("unsealing")
for key in unseal_keys_b64[:key_threshold]: 
    run_command(f"kubectl -n vault exec -it statefulsets/vault -- vault operator unseal {key}")

print("logging in")
run_command(f"kubectl -n vault exec -it statefulsets/vault -- vault login {root_token}")

print("running policy creation script")
run_command(r"kubectl -n vault exec -it statefulsets/vault -- sh /home/create-policies.sh")

print("installing MongoDB Helm chart")
run_command(r"helm install mongo charts/rp-mongo/ --namespace=vault --values charts/values.yaml --wait")

print("running mongo policy creation script")
run_command(r"kubectl -n vault exec -it statefulsets/vault -- sh /home/create-mongo-policies.sh")

print("adding the API key to the vault")
run_command(f"kubectl -n vault exec -it vault-0 -- vault kv put secret/basic-secret/helloworld apiKey={sys.argv[1]}")

print("starting app")
run_command(r"helm install app charts/rp-app/ --namespace=vault --values charts/values.yaml --wait")

print("done!")
