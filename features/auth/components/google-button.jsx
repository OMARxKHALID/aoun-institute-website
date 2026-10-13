"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/ui/button";

const GoogleButton = ({ callbackURL = "/dashboard" }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await authClient.signIn.social({ provider: "google", callbackURL });
  };

  return (
    <Button type="button" variant="outline" loading={loading} onClick={handleGoogle} className="w-full">
      Continue with Google
    </Button>
  );
};

export default GoogleButton;
