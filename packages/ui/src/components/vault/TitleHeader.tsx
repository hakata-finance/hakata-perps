import { tokenAddressToTokenE } from "@/lib/TokenUtils";
import { POOL_CONFIG } from "@/lib/constants";
import { PoolTokens } from "./PoolTokens";

interface Props {
  className?: string;
  iconClassName?: string;
}

export default function TitleHeader(props: Props) {
  return (
    <div className="flex flex-col space-x-1">
      <div className="flex flex-row items-center">
        <PoolTokens
          tokens={POOL_CONFIG.tokens.map(i => i.symbol)}
          className={props.iconClassName}
        />
        <p className="font-medium text-2xl">
          {POOL_CONFIG.poolName}
        </p>
      </div>
      <div className="text-s mt-3 flex flex-row font-medium text-zinc-500">
        <p>{tokenAddressToTokenE(POOL_CONFIG.tokens[0]!.mintKey.toBase58())}</p>

        {POOL_CONFIG.tokens
          .slice(1)
          .map((token) => (
            <p key={token.mintKey.toBase58()}>, {tokenAddressToTokenE(token.mintKey.toBase58())}</p>
          ))}
      </div>
    </div>
  );
}
