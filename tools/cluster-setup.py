import json
import subprocess
import sys

def run_command(description: str, cmd: str) -> str:
    print(description)
    out = subprocess.run(cmd.split(), capture_output=True)
    stdout = out.stdout.decode("utf-8")
    if out.returncode != 0:
        print(stdout)
        print()
        print(out.stderr.decode("utf-8"))
        exit(out.returncode)
    else:
        return stdout

if len(sys.argv[1:]) < 1: 
    print("Please specify the API key in the command line arguments")
    exit(1)

run_command(
    "Installing the Vault Helm chart",
    r"helm install vault charts/rp-vault/ --values charts/values.yaml --wait"
)

run_command(
    "waiting for pods",
    r"kubectl wait --namespace=vault --for=condition=Ready pod/vault-0"
)

key_shares = 5
key_threshold = 3
assert key_shares >= key_threshold

init_out = run_command(
    "initializing Vault",
    f"kubectl -n vault exec -it statefulsets/vault -- vault operator init -key-shares {key_shares} -key-threshold {key_threshold} -format json"
)
init_json = json.loads(init_out)

root_token = init_json["root_token"]
unseal_keys_b64 = init_json["unseal_keys_b64"]
unseal_keys_hex = init_json["unseal_keys_hex"]

print(f"obtained root token: {root_token}")
print("obtained unseal keys:\n\t{}".format("\n\t".join(unseal_keys_b64)))

for i, key in enumerate(unseal_keys_b64[:key_threshold]): 
    run_command(
        f"unsealing #{i}",
        f"kubectl -n vault exec -it statefulsets/vault -- vault operator unseal {key}"
    )

run_command(
    "logging in",
    f"kubectl -n vault exec -it statefulsets/vault -- vault login {root_token}"
)

run_command(
    "running policy creation script",
    r"kubectl -n vault exec -it statefulsets/vault -- sh /home/create-policies.sh"
)

run_command(
    "installing MongoDB Helm chart",
    r"helm install mongo charts/rp-mongo/ --namespace=vault --values charts/values.yaml --wait"
)

run_command(
    "running mongo policy creation script",
    r"kubectl -n vault exec -it statefulsets/vault -- sh /home/create-mongo-policies.sh"
)

run_command(
    "adding the API key to the vault",
    f"kubectl -n vault exec -it vault-0 -- vault kv put secret/basic-secret/helloworld apiKey={sys.argv[1]}"
)

run_command(
    "starting app",
    r"helm install app charts/rp-app/ --namespace=vault --values charts/values.yaml --wait"
)

print("done!")
