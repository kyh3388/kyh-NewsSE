package com.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/* 얘는 CORS 연결을 설정하려고 하는거임.
 * 리액트는 3000포트를 사용하고 스프링부트는 8080포트를 사용하는데
 * 리액트에서 뭔가 요청을 해도 서로 포트가 다르기 때문에 전달이 안됨.
 * "WebMvcConfigurer" 얘는 스프링부트에서 지원하는 매서드인데 스프링 기본 웹 설정을 사용자가 정의 할 수 있게 해줌.
 * 
*/

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
	// WebMvcConfigurer이 지원하는 addCorsMappings을 재정의함.
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		
		registry.addMapping("/**") // 얘는 /로 들어오는 모든걸 받겠다는 의미
			.allowedOrigins("http://localhost:3000") // 로컬 3000번 포트 요청은 다 받을거임.
			.allowedMethods("GET", "POST", "PUT", "DELETE") // 허용할 HTTP 메소드 형식
			.allowedHeaders("*") // 쿠키,인증 정보 등의 조건 허용
			.allowCredentials(true);
	}

}
