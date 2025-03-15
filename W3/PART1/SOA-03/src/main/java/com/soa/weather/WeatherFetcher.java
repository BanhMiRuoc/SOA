package com.soa.weather;

import java.util.HashMap;
import java.util.Map;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import okhttp3.OkHttpClient;
import okhttp3.Request;

@Path("/weather")
public class WeatherFetcher {
    
    private final String API_KEY = "ed0982070c2266a42c369a4dbd84ff9d";
    private final String BASE_URL = "http://api.openweathermap.org/data/2.5/weather";
    private final OkHttpClient client = new OkHttpClient();
    private static final Map<String, CacheData> cacheMap = new HashMap<>();
    private static final long CACHE_DURATION = 300000; // 5 phút
    
    private static class CacheData {
        String data;
        long timestamp;
        
        CacheData(String data, long timestamp) {
            this.data = data;
            this.timestamp = timestamp;
        }
    }

    private String getCachedData(String cacheKey){
        CacheData cache = cacheMap.get(cacheKey);
        if(cache != null){ // Nếu thời gian lưu vào > thời lượng lưu thì xóa
            long currentTime = System.currentTimeMillis();
            if (currentTime - cache.timestamp > CACHE_DURATION)
                cacheMap.remove(cacheKey);
            else
                return cache.data;
        }
        return null;
    }
    private void cacheData(String key, String data){
        cacheMap.put(key, new CacheData(data, System.currentTimeMillis()));
    }
    @GET
    @Path("/current/{city}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCurrentWeather(@PathParam("city") String city) {
        try {
            String cacheKey = city.toLowerCase();
            String cacheData = getCachedData(cacheKey);
            if(cacheData != null){
                return Response.ok(cacheData).build();
            }
            String url = String.format("%s?q=%s&appid=%s&units=metric&lang=vi", 
                                     BASE_URL, city, API_KEY);
            
            Request request = new Request.Builder()
                .url(url)
                .build();

            okhttp3.Response okResponse = client.newCall(request).execute();
            String jsonData = okResponse.body().string();
            
            if (!okResponse.isSuccessful()) {
                return Response.status(okResponse.code())
                             .entity(jsonData)
                             .build();
            }
            cacheData(cacheKey, jsonData);
            return Response.ok(jsonData).build();
            
        } catch (Exception e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(e.getMessage())
                         .build();
        }
    }

    @GET
    @Path("/coordinates/{lat}/{lon}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWeatherByCoordinates(@PathParam("lat") double lat, 
                                          @PathParam("lon") double lon) {
        try {
            String cacheKey = String.format("%f,%f", lat, lon);
            String cacheData = getCachedData(cacheKey);
            if(cacheData != null){
                return Response.ok(cacheData).build();
            }
            String url = String.format("%s?lat=%f&lon=%f&appid=%s&units=metric&lang=vi", 
                                     BASE_URL, lat, lon, API_KEY);
            
            Request request = new Request.Builder()
                .url(url)
                .build();

            okhttp3.Response okResponse = client.newCall(request).execute();
            String jsonData = okResponse.body().string();
            
            if (!okResponse.isSuccessful()) {
                return Response.status(okResponse.code())
                             .entity(jsonData)
                             .build();
            }
            cacheData(cacheKey, jsonData);
            return Response.ok(jsonData).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(e.getMessage())
                         .build();
        }
    }

    @GET
    @Path("/forecast/{city}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getForecast(@PathParam("city") String city) {
        try {
            String cacheKey = "forecast_" + city.toLowerCase();
            String cacheData = getCachedData(cacheKey);
            if(cacheData != null){
                return Response.ok(cacheData).build();
            }
            
            String url = String.format("http://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric&lang=vi", 
                                     city, API_KEY);
            
            Request request = new Request.Builder()
                .url(url)
                .build();

            okhttp3.Response okResponse = client.newCall(request).execute();
            String jsonData = okResponse.body().string();
            
            if (!okResponse.isSuccessful()) {
                return Response.status(okResponse.code())
                             .entity(jsonData)
                             .build();
            }
            
            cacheData(cacheKey, jsonData);
            return Response.ok(jsonData).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(e.getMessage())
                         .build();
        }
    }

    @GET
    @Path("/forecast/coordinates/{lat}/{lon}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getForecastByCoordinates(@PathParam("lat") double lat, 
                                           @PathParam("lon") double lon) {
        try {
            String cacheKey = String.format("forecast_%f,%f", lat, lon);
            String cacheData = getCachedData(cacheKey);
            if(cacheData != null){
                return Response.ok(cacheData).build();
            }
            
            String url = String.format("http://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric&lang=vi", 
                                     lat, lon, API_KEY);
            
            Request request = new Request.Builder()
                .url(url)
                .build();

            okhttp3.Response okResponse = client.newCall(request).execute();
            String jsonData = okResponse.body().string();
            
            if (!okResponse.isSuccessful()) {
                return Response.status(okResponse.code())
                             .entity(jsonData)
                             .build();
            }
            
            cacheData(cacheKey, jsonData);
            return Response.ok(jsonData).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(e.getMessage())
                         .build();
        }
    }
}