"use client";
import { useRouter, usePathname, useParams as useNextParams } from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (path: string, _options?: any) => {
    if (typeof path === 'string') {
      router.push(path);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname: pathname || '', search: '', hash: '', state: null };
}

export function useParams() {
  return (useNextParams() as Record<string, string>) || {};
}
