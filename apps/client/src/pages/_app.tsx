import "ui/styles.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react"
import { RecoilRoot } from 'recoil';
import Appbar from "@/components/Appbar";
import dynamic from "next/dynamic";

function MyApp({ Component,  pageProps: { session, ...pageProps }, }: AppProps) {
  return(
    <SessionProvider session={pageProps.session}>
      <RecoilRoot>
        <Appbar/>
        <Component {...pageProps} />
      </RecoilRoot>
    </SessionProvider>  
  )
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});