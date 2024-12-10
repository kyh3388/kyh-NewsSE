package com.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.service.SearchApiService;

// 여기에서 스프링부트로 들어오는 요청들 받고 각 클래스를 호출해서 결과 반환.
@RestController
public class SearchApiController {
	
	// SearchApiService를 주입받음
	@Autowired
	private SearchApiService searchApiService;
	
	// "/searchNews" 엔드포인트를 정의, 요청 파라미터로 검색어를 받는다.
	@GetMapping("/searchNews")
	public String searchNews( // searchApiService.java 파일에 searchNews 클래스를 호출
			@RequestParam String query,
			@RequestParam(defaultValue = "36") int display, // 한번에 36개 기사를 보여주기 위해 display 추가.
			@RequestParam(defaultValue = "1") int start // 시작 인덱스 추가
	) {
		return searchApiService.searchNews(query, display, start); // 검색 결과 반환
	}
}
