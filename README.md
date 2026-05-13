# Shop

The per-tenant shop application: a web store where an admin manages articles and customers browse, add to cart, and pay for articles using cryptocurrency. Instances of this application are deployed into the cluster by the [shop-operator](https://github.com/ShopHub-DevOps/shop-operator) on behalf of [ShopHub](https://github.com/ShopHub-DevOps/shophub).

## Roles

| Role | What they can do |
|---|---|
| Admin (shop owner) | Create, update, and delete articles. View orders. |
| Customer | Browse and search articles. Add items to a cart. Pay for the cart in crypto. |

## Tech stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 20 |
| Backend language | TypeScript |
| Backend framework | NestJS |
| Frontend framework | Next.js (React) |
| Web3 library | wagmi + viem |
| Wallet | Metamask |
| Blockchain | Ethereum Sepolia testnet |
| Payment token | USDT (ERC-20 on Sepolia) |
| Database (standard tier) | PostgreSQL, provisioned by CNPG |
| Database (light tier) | Redis, provisioned by REDB |
| Container registry | GitHub Container Registry (`ghcr.io/shophub-devops`) |
| Local Kubernetes | kind |

The database tier is selected per shop at creation time through the ShopHub admin panel and is reflected on the `Shop` custom resource reconciled by shop-operator.

## Running locally

To be documented once the backend and frontend are initialized. See the issues in this repository for the M1 task list.

## Related repositories

| Repository | Purpose |
|---|---|
| [shophub](https://github.com/ShopHub-DevOps/shophub) | Platform panel where users create and manage Shop deployments |
| [shop-operator](https://github.com/ShopHub-DevOps/shop-operator) | Kubernetes operator that deploys this application per tenant |
| [helm-charts](https://github.com/ShopHub-DevOps/helm-charts) | Helm charts for all services, including this one |
| [kube-state](https://github.com/ShopHub-DevOps/kube-state) | Declarative cluster state |

## License

MIT. See [LICENSE](./LICENSE).
