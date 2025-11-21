import { ButtonLink } from "../components/atoms/BackHomeLink";
import { Col, Row } from "antd";

export const NotFoundPage = () => (
  <div className="relative flex items-center  px-5 min-h-screen">
    {/* -------- Layer 1: Fixed BG -------- */}
    <img
      src="\Rectangle_481.png"
      alt="decor"
      className="fixed top-0 left-0 w-[100vh] h-auto"
    />
    <img
      src="\Rectangle_480.png"
      alt="decor"
      className="fixed bottom-0 right-0 w-[100vh] h-auto"
    />


    {/* -------- Layer 2: Floating 404 Card -------- */}
    <div className="relative w-[1100px]  h-screen mx-auto flex justify-center items-center z-10 ">

      <Row className="bg-[#627254] rounded-3xl shadow-2xl shadow-gray-950 z-10 w-full h-[550px]">

        <Col span={12} className="w-full">
          {/* -------- 2.1: 404 -------- */}
          <div className="relative flex-col h-full !pb-30 ">
            <img
              className="scale-80 z-1 rotate-355"
              src="/public/404.png"
              alt=""
            />
            <div className="flex justify-center h-fit">
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl tracking-widest font-[Rhodium_Libre] text-white">
                  Opps !
                </p>
                <p className="text-3xl tracking-widest font-[Rhodium_Libre] text-white">
                  PAGE NOT FOUND
                </p>
<br/>
                <ButtonLink to="/">Quay Về Trang Chủ</ButtonLink>
              </div>
            </div>
          </div>
        </Col>

        {/* -------- 2.2 bike and branding -------- */}
        <Col span={12} className="w-full  pl-5" >
          <div className="flex justify-end h-full">
            <div className="flex items-end flex-col py-10 px-5 h-fit">
              {/* -------- Branding -------- */}
              <h1 className=" text-6xl font-bold tracking-[.20em] font-[Josefin_Slab] text-[var(--natural-color)]">
                EMOB
              </h1>
              <p className="text-2xl tracking-widest font-[Rhodium_Libre] text-[var(--natural-color)] pr-2">
                Build green - Go green
              </p>
            </div>
            <div className="flex flex-col justify-end h-full">
              <img
                className="absolute scale-130 right-[3%]  z-1"
                src="/public/404_bike.png"
                alt=""
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div >
);


