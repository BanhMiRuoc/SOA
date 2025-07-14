from fastapi import FastAPI
from Cau1.ex1 import router as ex1_router
from Cau2.ex2 import router as ex2_router
from Cau3.ex3 import router as ex3_router
from Cau4.ex4 import router as ex4_router
from Cau5.ex5 import router as ex5_router
from Cau6.ex6 import router as ex6_router
from Cau7.ex7 import router as ex7_router

app = FastAPI()

app.include_router(ex1_router)
app.include_router(ex2_router)
app.include_router(ex3_router)
app.include_router(ex4_router)
app.include_router(ex5_router)
app.include_router(ex6_router)
app.include_router(ex7_router)