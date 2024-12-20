import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainPage.css';

/*************** 시간 표시를 위한 함수 ***************/
// 현재 시간을 기준으로 1분전, 1시간전 이렇게 표시
// 하루가 넘어가면 11.12 이렇게 당일 날짜로 표시

function formatTimeDifference(pubDate) {
	// 연산 할 수 있게 Date 객체로 변환
    const publishedDate = new Date(pubDate);
    // 현재 날짜와 시간 가져오기
    const now = new Date();
    
    // 날짜 비교를 위해 연/월/일을 각각 추출
    const publishedYear = publishedDate.getFullYear(); // 입력받은 날짜의 연도
    const publishedMonth = publishedDate.getMonth();  // 입력받은 날짜의 월 (0부터 시작)
    const publishedDay = publishedDate.getDate();     // 입력받은 날짜의 일

    // 현재 날짜의 연도, 월, 일을 각각 추출
    const currentYear = now.getFullYear(); // 현재 날짜의 연도
    const currentMonth = now.getMonth();  // 현재 날짜의 월 (0부터 시작)
    const currentDay = now.getDate();     // 현재 날짜의 일

    // 오늘 날짜인지 확인
    if (
        publishedYear === currentYear &&
        publishedMonth === currentMonth &&
        publishedDay === currentDay
    ) {
        // 오늘 날짜라면 현재 시간과의 차이를 계산
        const diffInMs = now - publishedDate; // 현재 시간 - 요청받은 시간 (밀리초 단위)
        const diffInMinutes = Math.floor(diffInMs / 60000); // 밀리초를 분 단위로 변환 (1분 = 60000ms)

        // 시간 차이에 따라 표시
        if (diffInMinutes < 1) // 1분 미만
        	return '방금 전'; 
        if (diffInMinutes < 60) // 1시간 미만
        	return `${diffInMinutes}분 전`; 

        const diffInHours = Math.floor(diffInMinutes / 60); // 시간을 계산
        return `${diffInHours}시간 전`; // 1시간 이상인 경우
        
    } else {
        // 오늘 날짜가 아니라면 '월.일' 형식으로 날짜 표시
        // `publishedDate.getMonth()`는 0부터 시작하므로 1을 더해줌
        return `${publishedDate.getMonth() + 1}.${publishedDate.getDate()}`;
    }
}
/********************************************/



/********** API 응답 데이터 HTML 표시 문제 해결 **********/

// 추가된 함수: API 응답 데이터에서 HTML 엔터티 디코딩(<,&,"" 이런 특수기호를 그대로 표시)
function decodeHtmlEntities(str) {
    const parser = new DOMParser();
    return parser.parseFromString(str, 'text/html').documentElement.textContent;
}

// 추가된 함수: API 응답 데이터에서 HTML 태그 제거
function removeHtmlTags(str) {
    return str.replace(/<[^>]+>/g, '');
}
/********************************************/




function MainPage() {
	
	const [news, setNews] = useState([]);
	const [page, setPage] = useState(1); // 페이지 상태 추가
	const displayCount = 36; // 한 번에 가져올 기사 수
	const [searchQuery, setSearchQuery] = useState('');
	const [searchHistory, setSearchHistory] = useState([]); // 검색 기록 관리
	const [isSearchFocused, setIsSearchFocused] = useState(false); // 검색창 포커스 상태 추가
	const location = useLocation();
	const navigate = useNavigate();
	
	// 1. 초기 화면 및 새로 고침
    useEffect(() => {
		const params = new URLSearchParams(location.search); // URL의 쿼리스트링을 파싱
		const query = params.get('query');
		
		// 'query' 파라미터가 없으면 기본값으로 '기사' 사용
		if (!query) {
            fetchNews(1, '기사'); // query가 없으면 '기사'로 요청
        } else {
            setSearchQuery(query); // 검색창 업데이트
            fetchNews(1, query); // query 값으로 뉴스 데이터 요청
        }
    }, [location.search]);  // location.search가 변경될 때마다 실행
	

	// 2. 뉴스 데이터 요청
	const fetchNews = (currentPage, query) => { // 현재 페이지 번호와 query를 매개변수로 받아서 뉴스 데이터 요청
		
		const start = (currentPage - 1) * displayCount + 1; // 시작 인덱스 계산('기사 더보기')
		
		// 검색어(query)가 없으면 기본 검색어를 '기사'로 설정
		const searchTerm = query && query.trim() !== '' ? query : '기사';
	
		axios
			.get(`http://localhost:8080/searchNews?query=${searchTerm}&display=36&start=${start}`)
			.then((response) => {
				// API 응답 확인(items에 어떤 항목들이 있는지 확인)
				// console.log('API 응답 데이터:', response.data);
				
				// 응답 데이터의 pubDate를 처리하여 새로운 배열 생성
				const processedNews = response.data.items.map((item) => ({
                	...item,
                	
                	// 제목,내용에서 HTML 엔터티 디코딩 및 태그 제거
                    title: decodeHtmlEntities(item.title),
                    description: decodeHtmlEntities(item.description),
                	
                	// 날짜 표시 방식 변경
                	formattedPubDate: formatTimeDifference(item.pubDate), // pubDate 포맷 적용
            	}));

                // 기존 데이터와 병합 및 중복 제거
            setNews((prevNews) => {
				if (currentPage === 1) {
       				return processedNews; // 첫 페이지에서는 기존 데이터를 초기화
    			}
                const combinedNews = [...prevNews, ...processedNews];
                
                // 시간순 정렬
                return combinedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            });
        })
            .catch(error => {
                console.error('Error fetching news:', error);
            });
    };
    
	
	
	// 초기 로딩 시 로컬 스토리지에서 검색 기록 불러오기
    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setSearchHistory(storedHistory);
    }, []);
	
    // 검색 버튼 클릭 이벤트
    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            navigate('/');
            return;
        }

        // 검색 기록 중복 확인 후 추가
        if (!searchHistory.includes(searchQuery)) {
            const updatedHistory = [searchQuery, ...searchHistory.slice(0, 9)]; // 최대 10개 유지
            setSearchHistory(updatedHistory); // 상태 업데이트
            
            // 로컬 스토리지 저장
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        }
		// 검색 결과 페이지로 이동
        navigate(`?query=${encodeURIComponent(searchQuery.trim())}`);
    };
    
    // 포커스 이벤트 핸들러
	//const handleFocus = () => {
	//	setIsSearchFocused(true); // 포커스가 있으면 검색 기록 표시
	//};

	// 포커스 해제 이벤트 핸들러
	//const handleBlur = () => {
	//	setTimeout(() => setIsSearchFocused(false), 1000); // 포커스 해제 후 검색 기록 숨기기 (200ms 딜레이)
	//};
    
    
    
    // "기사 더 보기" 버튼을 누르면 페이지 증가
	const handleLoadMore = () => {
		const nextPage = page + 1; // 다음 페이지
        setPage(nextPage); // 페이지 상태 업데이트
        fetchNews(nextPage, searchQuery); // 현재 검색 중인 쿼리로 데이터 요청
	};
    
    
    
	
/*************** 메인 페이지 출력 ***************/
// 배치(제목,시간,원문링크)
// "기사 더보기" 버튼

	return (
		<div className="MainPage"> 
			<div className="mainpage-head">
			
				<h1 className="header-title">
					<a href='/'
						style={{
								textDecoration: 'none',
								color: 'black'
							  }}
					>News SE</a>
				</h1>
				
				
	            <div style={{ position: 'relative' }}>
	                <div className="search-box">
	                	
	                    <input
	                        type="text"
	                        className="search-text"
	                        placeholder="뉴스 검색"
	                        value={searchQuery} // 입력값을 상태로 유지
     		   				onChange={(e) => setSearchQuery(e.target.value)} // 상태 업데이트
	                        
	                        onFocus={() => setIsSearchFocused(true)} // 포커스 시 상태 업데이트
    						onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // 포커스 해제 시 상태 업데이트
	                    />
	                    <button
	                        type="button"
	                        className="search-button"
	                        onClick={handleSearch} // 검색 버튼 클릭 시 handleSearch 호출
	                    />
	                    
	                </div>
				
					{/* 검색 기록 표시 */}
					{isSearchFocused && (
						<div className="search-history">
						    <ul>
						        {searchHistory.map((historyItem, index) => (
						            <li
						            	key={index}
						            	className="history-item"
						            	onClick={() => {
											setSearchQuery(historyItem); // 클릭된 검색어를 검색창에 입력
						                    navigate(`?query=${encodeURIComponent(historyItem)}`); // 검색 결과 페이지로 이동
						                    fetchNews(1, historyItem); // 첫 페이지 데이터 요청
						                }}
						                style={{ cursor: 'pointer' }} // 클릭 가능하도록 스타일 추가		            
						            >
						            
						                <span>{historyItem}</span>
						                <button
						                    className="delete-btn"
						                    onClick={(e) => {
						                        e.stopPropagation(); // 클릭 이벤트 전파 방지
						                        const updatedHistory = searchHistory.filter((_, i) => i !== index);
						                        setSearchHistory(updatedHistory);
						                        // 로컬 스토리지 업데이트
						                        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
						                    }}
						                >
						                    X
						                </button>
						            </li>
						        ))}
						    </ul>
						</div>
					)}
				</div>
			</div>
			
			<div className="mainpage-body">
				{/* 기사를 6개씩 나눠 블록으로 그룹화 */}
			    {Array.from({ length: Math.ceil(news.length / 6) }).map((_, blockIndex) => (
			        <div className="block" key={blockIndex}>
			            <div className="grid-container">
			                {news.slice(blockIndex * 6, blockIndex * 6 + 6).map((item, index) => (
			                    <div key={index} className="grid-item">	
									<Link
									    to="/extra-page"
									    state={{
									        title: item.title,
									        pubDate: item.pubDate,
									        description: item.description,
									        link: item.link,
									    }}
									    style={{
											textDecoration: 'none',
											color: 'black',
											fontWeight: 'bold',
										}}
									    
									>
									    <h2>{item.title}</h2>
									</Link>
									
									{/* 날짜와 버튼을 한 줄에 정렬 */}
			    					<div className="grid-item-info">
					                        <p>{item.formattedPubDate}</p>
					                        <a
					                        	href={item.link}
					                        	target="_blank"
					                        	rel="noopener noreferrer"
					                        	className="original-link-button"
					                        >
					                        	<i>🔗</i>
					                        </a>
				                    </div>
				               </div>
			                ))}
						</div>
					</div>
				))}
			</div>
			
			<div className="mainpage-foot">
				<button className="news-plus" onClick={handleLoadMore}>기사 더보기▼</button>
			</div>
		</div>
	);

// target="blank" : 새 탭에서 화면 열기
// rel="noopener noreferrer" : 보안과 프라이버시 보호를 위해 새 탭에서 열린 페이지가 원래 페이지에 접근하지 못하게 하고, 원래 페이지의 참조 정보도 전달되지 않도록 한다
/********************************************/
	
}

export default MainPage;
















