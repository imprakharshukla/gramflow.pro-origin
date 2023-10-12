import NavMenu from "~/features/ui/components/navMenu";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <div className={""}>
          <div className={"mb-10"}>
            <NavMenu/>
          </div>
            <main className="">
                {children}
            </main>
        </div>

    )
}
