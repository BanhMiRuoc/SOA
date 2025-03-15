package com.soa.computing;

public class Student {
	
	private String id;
	private String name;
	private int gender;
	private String major;
	
	public Student() {
		this.id = this.name = this.major = "";
		this.gender = 0;
	}
	
	public Student(String id, String name, int gender, String major) {
		this.id = id;
		this.name = name;
		this.gender = gender;
		this.major = major;
	}
	
	public Student(Student another) {
		this.id = another.id;
		this.name = another.name;
		this.gender = another.gender;
		this.major = another.major;
	}

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getGender() {
		return gender;
	}
	public void setGender(int gender) {
		this.gender = gender;
	}
	public String getMajor() {
		return major;
	}
	public void setMajor(String major) {
		this.major = major;
	}
	
	public void cloneObject(Student another) {
		this.id = another.id;
		this.name = another.name;
		this.gender = another.gender;
		this.major = another.major;
	}

	@Override
	public String toString() {
		return "Student [id=" + id + ", name=" + name + ", gender=" + gender + ", major=" + major + "]";
	}

}
