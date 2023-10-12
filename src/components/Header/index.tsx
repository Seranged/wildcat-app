import * as React from "react";


import { ReactComponent as WildcartLogo } from '../../images/wildcat-logo-white.svg';
import ConnectButton from "./ConnectButton";
import NavItem from "./NavItem";

export const Header = () => {
    return (
        <div className="h-20 bg-black px-8 py-4 flex items-center justify-between bg-">
            <WildcartLogo className="h-full" />
            <div className="flex flex-1 items-center justify-center gap-10">
                <NavItem name="Borrowers" link="/borrower/agreement" />
                <NavItem name="Lenders" link="/lender/agreement" />
            </div>

            <ConnectButton />
        </div>
    )
}