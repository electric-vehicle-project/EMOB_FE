import { Col, Row } from "antd";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <>
      <div className="relative flex items-center  px-5 min-h-screen">
        {/* -------- Layer 1: Fixed BG -------- */}
        <img
          src="\Rectangle 481.png"
          alt="decor"
          className="fixed top-0 left-0 w-[100vh] h-auto"
        />
        <img
          src="\Rectangle 480.png"
          alt="decor"
          className="fixed bottom-0 right-0 w-[100vh] h-auto"
        />

         {/* -------- Layer 2: Floating Auth Card -------- */}
        <div className="relative w-[1000px]  h-screen mx-auto flex justify-center items-center z-10 ">
          <Row className="bg-[#627254] rounded-3xl shadow-2xl shadow-gray-950 z-10 w-full h-[550px]">
            
            <Col span={12} className="w-full  pl-5">
              
               {/* -------- 2.1: Branding & Images -------- */}
              <div className="bg-[#627254] flex h-full">
                <div className="flex flex-col py-10 h-full w-[70%]">
                  {/* -------- Branding -------- */}
                  <div>
                    <h1 className=" text-6xl ml-6 font-bold tracking-[.20em] font-[Josefin_Slab] text-[var(--natural-color)]">
                      EMOB
                    </h1>
                    <p className="text-2xl ml-6 tracking-widest font-[Rhodium_Libre] text-[var(--natural-color)] ">
                      Build green
                      <br />
                      Go green
                    </p>
                  </div>

                  {/* -------- Images -------- */}
                  <div className="relative flex justify-center flex-1">
                    <img
                      className="absolute top-10  scale-150 left-[13%] z-1"
                      src="/public/E-BIKE main.png"
                      alt=""
                    />
                    <img
                      className="absolute -top-2 -right-[40%] scale-x-[-1] rotate-25 h-35"
                      src="/public/green leaf 2.png"
                      alt=""
                    />
                    <img
                      className="absolute top-[20%] scale-70 -left-[53%]"
                      src="/public/green battery.png"
                      alt=""
                    />
                  </div>
                </div> 
                
                {/* -------- 2.2 Login Card (left-side) -------- */}
                <div className="w-[30%] bg-[var(--natural-color)] rounded-l-3xl"></div>
              </div>
            </Col>
            
            {/* -------- 2.2 Login Card (remain-side ) -------- */}
            <Col span={12} className="bg-[var(--natural-color)] pt-10 pr-5 rounded-r-3xl">
              <div className="w-full h-full pl-5">
                <Outlet />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default AuthLayout;


