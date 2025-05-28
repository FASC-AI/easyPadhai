class StudentModel {
  int? code;
  bool? status;
  String? message;
  List<StudentModelData>? data;

  StudentModel({this.code, this.status, this.message, this.data});

  StudentModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <StudentModelData>[];
      json['data'].forEach((v) {
        data!.add(new StudentModelData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class StudentModelData {
  String? name;
  String? sId;
  bool isSelected = false;

  StudentModelData({this.name, this.sId});

  StudentModelData.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['name'] = this.name;
    data['_id'] = this.sId;
    return data;
  }
}
