import Link from "next/link";
import React from "react";

const AuthHeader = () => {
  return (
    <header className="shadow-sm">
      <div className="container mx-auto text-center py-5">
        <h1 className="">
          <Link href={`/`}>
            <span className="text-2xl font-semibold">E-Com</span>
          </Link>
        </h1>
      </div>
    </header>
  );
};

export default AuthHeader;
