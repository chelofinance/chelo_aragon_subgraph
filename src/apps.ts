import {Bytes} from "@graphprotocol/graph-ts";
import {fetchAccount} from "@openzeppelin/subgraphs/src/fetch/account";
import {fetchERC20} from "@openzeppelin/subgraphs/src/fetch/erc20";
import {SetApp} from "../generated/templates/Kernel/Kernel";
import {Organization, App} from "../generated/schema";
import {TokenManager} from "../generated/templates/TokenManager/TokenManager";
import {erc20 as ERC20Template} from "../generated/templates";

import {
  KERNEL_DEFAULT_ACL_APP_ID,
  VOTING_APP_ID,
  AGENT_APP_ID,
  EVM_SCRIPT_REGISTRY_APP_ID,
  KERNEL_CORE_APP_ID,
  TOKEN_MANAGER_APP_ID,
} from "./constants";

const getAppName = (appId: Bytes): string => {
  const id = appId.toHexString();
  if (id == KERNEL_DEFAULT_ACL_APP_ID) return "acl";
  if (id == EVM_SCRIPT_REGISTRY_APP_ID) return "evm-script-registry";
  if (id == KERNEL_CORE_APP_ID) return "kernel";
  if (id == VOTING_APP_ID) return "voting";
  if (id == AGENT_APP_ID) return "agent";
  if (id == TOKEN_MANAGER_APP_ID) return "token-manager";
  return "";
};

export function handleSetApp(event: SetApp): void {
  const dao = Organization.load(event.address.toHex());
  const app = new App(event.params.appId.toHex().concat("/").concat(event.params.app.toHex()));

  app.account = fetchAccount(event.params.app).id;
  app.appId = event.params.appId.toHex();
  app.name = getAppName(event.params.appId);

  if (app.name === "token-manager" && dao) {
    const tokenManager = TokenManager.bind(event.params.app);
    const tokenAddress = tokenManager.try_token().value;
    const token = fetchERC20(tokenAddress);

    ERC20Template.create(tokenAddress);
    dao.token = token.id;
    dao.save();
  }

  if (dao) app.organization = dao.id;
  app.save();
}
