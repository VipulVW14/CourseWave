import "ui/styles.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import { RecoilRoot } from 'recoil';
import { InitUser } from "@/components/InitUser";
import Appbar from "@/components/Appbar";

export default function MyApp({ Component,  pageProps: { session, ...pageProps }, }: AppProps) {
  return(
    <SessionProvider session={pageProps.session}>
      <RecoilRoot>
        <InitUser/>
        <Appbar/>
        <Component {...pageProps} />
      </RecoilRoot>
    </SessionProvider>  
  )
}