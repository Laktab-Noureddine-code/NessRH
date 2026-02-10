import { useEffect, useState } from "react";
import api from "../api/axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/api/me")
      .then((res) => {
        console.log("useAuth: API response =", res.data);
        setUser(res.data?.user ?? null);
        setCompany(res.data?.company ?? null);
      })
      .catch(() => {
        setUser(null);
        setCompany(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return { user, company, loading };
};
