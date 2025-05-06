class DistrictModel {
  bool? status;
  String? message;
  List<DistrictData>? data;

  DistrictModel({this.status, this.message, this.data});

  DistrictModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <DistrictData>[];
      json['data'].forEach((v) {
        data!.add(DistrictData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class DistrictData {
  Name? name;
  String? sId;
  bool? isActive;
  String? code;
  String? rtoCode;
  String? id;
  Name? shortName;
  String? districtPopulation;

  DistrictData(
      {this.name,
      this.sId,
      this.isActive,
      this.code,
      this.rtoCode,
      this.id,
      this.shortName,
      this.districtPopulation});

  DistrictData.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? Name.fromJson(json['name']) : null;
    sId = json['_id'];
    isActive = json['isActive'];
    code = json['code'];
    rtoCode = json['rtoCode'];
    id = json['id'];
    shortName =
        json['shortName'] != null ? Name.fromJson(json['shortName']) : null;
    districtPopulation = json['districtPopulation'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (name != null) {
      data['name'] = name!.toJson();
    }
    data['_id'] = sId;
    data['isActive'] = isActive;
    data['code'] = code;
    data['rtoCode'] = rtoCode;
    data['id'] = id;
    if (shortName != null) {
      data['shortName'] = shortName!.toJson();
    }
    data['districtPopulation'] = districtPopulation;
    return data;
  }
}

class Name {
  String? english;
  String? hindi;

  Name({this.english, this.hindi});

  Name.fromJson(Map<String, dynamic> json) {
    english = json['english'];
    hindi = json['hindi'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['english'] = english;
    data['hindi'] = hindi;
    return data;
  }
}
