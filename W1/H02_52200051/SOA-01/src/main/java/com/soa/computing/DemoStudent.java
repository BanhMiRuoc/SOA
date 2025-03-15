package com.soa.computing;
import javax.ws.rs.core.Response;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

@Path("/student")
public class DemoStudent {
	private static final List<Student> students = new ArrayList<>();
	static {
		students.add(new Student("S01", "Alice Nguyen", 0, "Computer Science"));
        students.add(new Student("S02", "Bob Tran", 1, "Mechanical Engineering"));
        students.add(new Student("S03", "Charlie Pham", 1, "Business Administration"));
        students.add(new Student("S04", "Diana Hoang", 0, "Design"));
        students.add(new Student("S05", "Evan Le", 1, "Information Technology"));
	}
	@GET
	@Path("/check/{id}")
	@Produces(MediaType.TEXT_PLAIN)
	public Boolean checkStudentExists(@PathParam("id") String id) {
		for(Student student: students) {
			if(student.getId().equalsIgnoreCase(id))
				return true;
		}
		return false;
	}
	
	@PUT
	@Path("/change/{id}/{gender}")
	@Produces(MediaType.TEXT_PLAIN)
	public Response changeGender(@PathParam("id") String id, @PathParam("gender") int gender) {
		//0:male 1:female
		try {
			for(Student student: students) {
				if(student.getId().equalsIgnoreCase(id)) {
					if(student.getGender()==gender) {
						return Response.ok(student.getName()+" is not changed gender: " + (gender == 1 ? "Female" : "Male")).build(); //return 200 is OK
					}
					student.setGender(gender);
					return Response.ok(student.getName()+" is changed gender: " + (gender == 1 ? "Female" : "Male")).build(); //return 200 is OK
				}
			}
			return Response.ok("ID is not found").build();
		} catch(Exception e) {
			System.out.print(e.getMessage());
			return Response.status(Response.Status.NOT_FOUND).entity("false").build();
		}
	}
	
	@GET
	@Path("/search/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Student searchStudentById(@PathParam("id") String id) {
		for(Student student: students) {
			if(student.getId().equalsIgnoreCase(id))
				return student;
		}
		return new Student();
	}

}