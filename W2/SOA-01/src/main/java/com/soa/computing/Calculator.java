package com.soa.computing;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.text.SimpleDateFormat;  
import java.util.Date;
import org.joda.time.DateTimeZone;
import org.joda.time.DateTime;

@Path("/calculator")
public class Calculator {
	
	@GET
	@Path("/compute-interest/{month}/{deposit}/")
	@Produces(MediaType.TEXT_PLAIN)
	public double computeInterests(@PathParam("deposit") double deposit, @PathParam("month") int month)
	{
		double interestRate = 0.073;
		double output = deposit * (double) month * (interestRate/12.0);
		return output;
	}
	
	@GET
	@Path("/getdatetime/")
	@Produces(MediaType.TEXT_PLAIN)
	public String getDateTime()
	{
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		Date date = new Date();
		String output = formatter.format(date).toString();
		return output;
	}
	
	@GET
	@Path("/getdatetime/{region}/{location}")
	@Produces(MediaType.TEXT_PLAIN)
	public String getDateTime(@PathParam("region") String region, @PathParam("location") String location)
	{
		String zone = region + "/" + location;
		DateTimeZone timeZone = DateTimeZone.forID(zone); //Asia-Ho_Chi_Minh
		DateTime dateTime = new DateTime(timeZone);
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		formatter.setTimeZone(timeZone.toTimeZone());
		return formatter.format(dateTime.toDate()) + " Zone: " + dateTime.getZone();

	}
	
	@POST
	@Path("/create-student-instance/")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createStudentInstance(Student s)
	{
		if(s == null) {
			return Response.serverError().entity("Student object cannot be NULL.").build();
		}
		
		System.out.println(s.toString());

		return Response.status(200).entity("Student object has been successfully created.").build();
	}

}
