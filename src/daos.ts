import {fetchAccount} from "@openzeppelin/subgraphs/src/fetch/account";
import {DeployDAO} from "../generated/DaoFactory/DaoFactory";
import {Organization} from "../generated/schema";

export function handleCreateDao(event: DeployDAO): void {
  const dao = new Organization(event.params.dao.toHex());
  dao.account = fetchAccount(event.params.dao).id;
  dao.createdAt = event.block.timestamp;
  dao.save();
}
