import { tokenAddressToTokenE } from "@/lib/TokenUtils";
import { POOL_CONFIG } from "@/lib/constants";
import { PoolTokens } from "./PoolTokens";

interface Props {
  className?: string;
  iconClassName?: string;
}

export default function TitleHeader(props: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center space-x-2">
        <PoolTokens
          tokens={POOL_CONFIG.tokens.map(i => i.symbol)}
          className={props.iconClassName}
        />
        <p className="font-medium text-2xl text-white">
          {POOL_CONFIG.poolName}
        </p>
      </div>
      <div className="mt-2 flex flex-row font-medium text-gray-400 text-sm">
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
