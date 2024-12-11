import React from 'react';
import { useLocation } from 'react-router-dom';
import './ExtraPage.css';
import dayjs from "dayjs"; // dayjs : 날짜 포맷팅 라이브러리

function ExtraPage() {
	const location = useLocation();
	const { title, description, link, pubDate } = location.state || {};
	
	const formattedDate = pubDate
		? dayjs(pubDate).format("YYYY년 MM월 DD일 HH시 mm분")
		: "등록 시간 미확인";
		
	return (
		<div className='ExtraPage'>
			<div className='extrapage-head'>
				<h1 className="head-title">
					<a href='/'
						style={{
							textDecoration: 'none',
							color: 'black'
						}}
					>News SE</a>
				</h1>
				
			</div>
		
			<div className='extrapage-body'>
				
				<div>
					<h1 className="title">{title}</h1>
					<p className="date">{formattedDate}</p>
					<p className="description">{description}</p>
			        <a
			            href={link}
			            target="_blank"
			            rel="noopener noreferrer"
			            style={{textDecoration: 'none', color: 'blue'}}	
			        >기사 원문 보러가기</a>
	        	</div>
			</div>
		
       </div>
	);
}

export default ExtraPage;























