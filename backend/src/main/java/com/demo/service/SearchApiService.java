package com.demo.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SearchApiService {
	
	// application.properties에서 설정한 아이디와 시크릿을 호출해서 사용.
	@Value("${naver.client-id}")
	private String clientId;
	
	@Value("${naver.client-secret}")
	private String clientSecret;
	
	
	
	public String searchNews(String keyword, int displayCount, int start) {
		String text; // 인코딩된 검색어 저장
		try {
			text = URLEncoder.encode(keyword, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException("검색어 인코딩 실패", e);
		}
		
		
		String apiURL = "https://openapi.naver.com/v1/search/news?query=" + text +
						"&display=" + displayCount +
						"&start=" + start; // JSON으로 결과 받기
		
		Map<String, String> requestHeaders = new HashMap<>();
		
		// "X-Naver-..."은 네이버 API에서 요구하는 HTTP 요청 헤더의 키.
		requestHeaders.put("X-Naver-Client-Id", clientId); // 위에서 클라이언트 아이디랑 연결한 변수
		requestHeaders.put("X-Naver-Client-Secret", clientSecret); // 위에서 클라이언트 시크릿이랑 연결한 변수
		
		// JSON 응답을 그대로 반환(일단 기자명,기사url 등 필요없는 정보까지 다 받고 리액트에서는 신문사,기사제목 등 필요한 정보만 가져다가 씀)
		return get(apiURL, requestHeaders);
	}
	
	
	
	
	
	private static String get(String apiUrl, Map<String, String> requestHeaders) {
		HttpURLConnection con = connect(apiUrl);
		try {
			con.setRequestMethod("GET");
			for (Map.Entry<String, String> header : requestHeaders.entrySet()) {
				con.setRequestProperty(header.getKey(), header.getValue());
			}
			
			int responseCode = con.getResponseCode();
			if (responseCode == HttpURLConnection.HTTP_OK) { // 정상 호출
				return readBody(con.getInputStream());
			} else { // 오류 발생
				return readBody(con.getErrorStream());
			}
		} catch (IOException e) {
			throw new RuntimeException("API 요청과 응답 실패", e);
		} finally {
			con.disconnect();
		}
	}
	
	private static HttpURLConnection connect(String apiUrl){
        try {
            URL url = new URL(apiUrl);
            return (HttpURLConnection)url.openConnection();
        } catch (MalformedURLException e) {
            throw new RuntimeException("API URL이 잘못되었습니다. : " + apiUrl, e);
        } catch (IOException e) {
            throw new RuntimeException("연결이 실패했습니다. : " + apiUrl, e);
        }
    }


    private static String readBody(InputStream body){
        InputStreamReader streamReader = new InputStreamReader(body);


        try (BufferedReader lineReader = new BufferedReader(streamReader)) {
            StringBuilder responseBody = new StringBuilder();


            String line;
            while ((line = lineReader.readLine()) != null) {
                responseBody.append(line);
            }


            return responseBody.toString();
        } catch (IOException e) {
            throw new RuntimeException("API 응답을 읽는 데 실패했습니다.", e);
        }
    }
}