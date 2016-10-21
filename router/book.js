const express=require("express");
const mysql_util=require("./mysql_util");
const router=express.Router();
const routerUser=require("./user");

router.route("/").get(function(req,res){
	mysql_util.DBConnection.query("SELECT bookCate FROM hopeBook GROUP BY bookCate",function(err,rows,fields){
		if(err){
			res.send("出错了，请联系管理员");
			return;
		}else{
			var bookCate=rows;
			var bookAll=[];
			/*console.log("aaaa");*/
			var i=0;
			function queryBook(bookCate,i){
				if(i<bookCate.length-1){
				 mysql_util.DBConnection.query("SELECT * FROM hopeBook WHERE bookCate=? AND bookLeft>0 ORDER BY bookID DESC LIMIT 0,4",[bookCate[i].bookCate],function(err,rows,fields){
					if(err){
						console.log("err");
						return;
					}else{
						bookAll.push(rows);
						i++;
						queryBook(bookCate,i);
					}
				});
				}else{
					mysql_util.DBConnection.query("SELECT * FROM hopeBook WHERE bookCate=? AND bookLeft>0 ORDER BY bookID DESC LIMIT 0,4",[bookCate[i].bookCate],function(err,rows,fields){
					if(err){
						console.log("err");
						return;
					}else{
						bookAll.push(rows);
						var bookCateEng=[]
						res.render("book/index",{"book":bookAll,"cate":bookCate})
					}
				});
				}
			}
			queryBook(bookCate,i);
				/*console.log(bookCate[i].bookCate);
				mysql_util.DBConnection.query("SELECT * FROM hopeBook WHERE bookCate=?",[bookCate[i].bookCate],function(err,rows,fields){
					if(err){
						console.log("err");
						return;
					}else{
						console.log("hhhhhh");
						console.log(rows.length);
						bookAll.push(rows);
					}
				});
			console.log("bbbb");
			console.log(bookAll.length);*/
			
		}
	});
}).post(function(req,res){
	console.log("post");
	console.log(!req.headers.cookie);
	console.log(req.cookies);
	if(!req.cookies.userId){
		var err={
			code:10
		};
		res.send(err);
	}else{
		var borrowID=req.body.borrowID;
		var userID=req.cookies.userId;
		console.log(userID,borrowID);
		mysql_util.DBConnection.query("SELECT bookLeft FROM hopeBook WHERE bookID=?",[borrowID],function(err,rows,fields){
			if(err){
				console.log(err);
			}else{
				var left=rows[0].bookLeft-1;
				console.log("left:"+left);
				console.log(req.cookies.userId);
                var userId=parseInt(req.cookies.userId);
				mysql_util.DBConnection.query("UPDATE hopeBook SET bookLeft=? WHERE bookID=?;INSERT bookBorrow VALUES(DEFAULT,?,?,CURDATE(),DEFAULT,ADDDATE(CURDATE(),30));",[left,borrowID,borrowID,userId],function(err,rows,fields){
					if(err){
						console.log(err)
					}else{
						var success={
							message:"借阅成功"
						}
						res.send(success);
					}
				})
			}
		})
	}
})

router.route("/cate:cateID").get(function(req,res){
	var groupID=req.params.cateID;
	console.log(groupID)
	mysql_util.DBConnection.query("SELECT  DISTINCT bookCate FROM hopeBook ORDER BY bookCate",function(err,rows,fields){
		if(err){
			console.log(err);
			return;
		}
		console.log(rows[0].bookCate);
		var cateArr=rows;
		mysql_util.DBConnection.query("SELECT * FROM hopeBook WHERE bookCate=? ORDER BY bookLeft DESC",cateArr[groupID].bookCate,function(err,rows,fields){
			if(err){
				console.log(err);
				return;
			}
			res.render("book/bookCate",{book:rows,cate:cateArr[groupID].bookCate});
		})
	})
})


module.exports=router;